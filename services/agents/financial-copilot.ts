import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { SpendingAgent } from "./spending-agent"
import { BudgetAgent } from "./budget-agent"
import { GoalAgent } from "./goal-agent"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export class FinancialCopilot {
    // 1. Classify User Intent (Dynamic Routing)
    static async classifyIntent(message: string): Promise<string[]> {
        try {
            const prompt = `
You are a routing agent for a financial copilot. Classify the user's message into one or more of these categories:
- "spending" (if asking about spending habits, categories, transactions, subscriptions, historical purchases, total spent)
- "budget" (if asking about budgets, limits, overspending, room to spend, category constraints)
- "goals" (if asking about goals, target amounts, deadline horizons, saving planning, future big purchases)

User message: "${message}"

Output ONLY a JSON array of string categories.
Example: ["spending", "budget"]
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an intent routing assistant. You output ONLY a structured JSON array.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "[]"
            const parsed = JSON.parse(responseText)
            return parsed.categories || ["spending", "budget", "goals"]
        } catch (error) {
            console.error("Intent classification failed, routing to all agents:", error)
            return ["spending", "budget", "goals"]
        }
    }

    // 2. Fetch User Memories (AI Memory)
    static async getUserMemories(userId: string): Promise<string[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from("ai_memory")
                .select("memory")
                .eq("user_id", userId)
                .order("importance_score", { ascending: false })
                .limit(5)

            if (error) throw error
            return (data || []).map((m) => m.memory)
        } catch (error) {
            console.error("Failed to load user memories:", error)
            return []
        }
    }

    // 3. Save New Memory if important info detected
    static async storeNewMemoryIfFound(userId: string, message: string) {
        try {
            const prompt = `
Analyze this user message to see if there is any personal financial fact or preference that should be remembered for the long term (e.g. "I want to buy a car next year", "My monthly salary is $4500", "I try to keep my dining budget below $200").
If there is an important fact, extract it as a short memory string. If there is no important fact, output an empty string.

User message: "${message}"

Provide your response in EXACTLY this JSON format:
{
  "memory": "Short factual memory string or empty string",
  "importanceScore": 1 to 5 numeric value of how important this is (e.g., salary/major purchases are 5, dining preferences are 2)
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a factual extraction agent. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            if (parsed.memory && parsed.memory.trim() !== "") {
                const { error } = await supabaseAdmin
                    .from("ai_memory")
                    .insert([{
                        user_id: userId,
                        memory: parsed.memory.trim(),
                        importance_score: parsed.importanceScore || 1
                    }])
                if (error) throw error
                console.log("New financial memory stored:", parsed.memory)
            }
        } catch (error) {
            console.error("Failed to store new AI memory:", error)
        }
    }

    // 4. Supervisor Main Routing & Execution Loop
    static async askCopilot(userId: string, userMessage: string) {
        // Step A: Classify Intent
        const intents = await this.classifyIntent(userMessage)
        console.log(`Supervisor categorized intents for message "${userMessage}":`, intents)

        // Step B: Load memories
        const memories = await this.getUserMemories(userId)

        // Step C: Execute target sub-agents
        let spendingData = null
        let budgetData = null
        let goalData = null

        if (intents.includes("spending")) {
            spendingData = await SpendingAgent.generateInsights(userId)
        }

        if (intents.includes("budget")) {
            budgetData = await BudgetAgent.runAgent(userId)
        }

        if (intents.includes("goals")) {
            // Get monthly net savings rate from spending-agent if available, or fetch it
            let actualMonthlySavings = 0
            if (spendingData) {
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
                const { data } = await supabaseAdmin.from("expenses").select("*").eq("user_id", userId).gte("date", startOfMonth)
                const list = (data || [])
                const inc = list.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0)
                const exp = list.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0)
                actualMonthlySavings = inc - exp
            }
            goalData = await GoalAgent.runAgent(userId, actualMonthlySavings)
        }

        const aggregatedResult = {
            intentsEvaluated: intents,
            spending: spendingData,
            budget: budgetData,
            goals: goalData
        }

        // Step D: Generate conversational final answer from Llama 3.3
        const prompt = `
You are the elite AI Financial Copilot for a premium personal finance app.
The user is asking: "${userMessage}"

Here is the real-time financial agent data we compiled:
${JSON.stringify(aggregatedResult, null, 2)}

User Memories:
${memories.length > 0 ? memories.map(m => `- ${m}`).join("\n") : "No previous memories stored."}

Your job is to write a highly polished, premium, conversational response that directly answers the user's question using the metrics.
Rules:
- Be encouraging, motivate positive savings, and be concrete.
- Do not repeat raw data sets or JSON structures. Use natural formatting.
- Bullet points, clean lists, and bold text are excellent.
- Keep it concise, professional, and data-driven.
`
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an elite AI financial advisor. You provide insightful personal finance advice based on database metrics.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.5,
            max_tokens: 800,
        })

        const finalAnswer = completion.choices[0]?.message?.content || "I am currently unable to analyze your query. Please try again."

        // Step E: Store new memory in background if any facts are found
        await this.storeNewMemoryIfFound(userId, userMessage)

        // Step F: Write action log to database
        try {
            await supabaseAdmin.from("agent_logs").insert([{
                user_id: userId,
                agent_name: "FinancialCopilotSupervisor",
                action: userMessage,
                result: {
                    intents,
                    finalAnswer: finalAnswer.slice(0, 1000), // truncate for safety
                    hasSpending: !!spendingData,
                    hasBudget: !!budgetData,
                    hasGoals: !!goalData
                }
            }])
        } catch (logError) {
            console.error("Failed to write agent execution log:", logError)
        }

        return {
            answer: finalAnswer,
            analysis: aggregatedResult
        }
    }
}
