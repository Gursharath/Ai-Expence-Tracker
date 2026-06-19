import OpenAI from "openai"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { MemoryService, AIMemory } from "@/services/memory-service"
import { AgentLog, AgentResponse } from "./types"

// Import sub-agents
import { SpendingAnalystAgent } from "./SpendingAnalystAgent"
import { BudgetAgent } from "./BudgetAgent"
import { SavingsAgent } from "./SavingsAgent"
import { SubscriptionAgent } from "./SubscriptionAgent"
import { ForecastAgent } from "./ForecastAgent"
import { FinancialCoachAgent } from "./FinancialCoachAgent"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface OrchestratorResult {
    answer: string
    activeAgents: string[]
    timeline: AgentLog[]
    memoriesUsed: string[]
    subAgentData: {
        spending?: any
        budget?: any
        savings?: any
        subscriptions?: any
        forecast?: any
        coach?: any
    }
}

export class FinancialOrchestratorAgent {
    static async run(userId: string, userMessage: string): Promise<OrchestratorResult> {
        const startTime = Date.now()
        const timeline: AgentLog[] = []
        const activeAgents: string[] = []

        const logStep = (action: string, detail: string) => {
            timeline.push({
                timestamp: new Date().toISOString(),
                action,
                detail,
            })
        }

        logStep("Orchestrator Init", `Received user query: "${userMessage}"`)

        // Step 1: Query Routing (Intent Classification)
        logStep("Intent Classification", "Analyzing query to identify relevant specialized sub-agents...")
        let intents: string[] = []
        try {
            const classificationPrompt = `
You are the Supervisor Orchestrator of a multi-agent financial copilot.
Classify the user's query into one or more target sub-agent topics:
- "spending" (if asking about bills, categories, transactions, spending growth, historical trends, anomalies)
- "budget" (if asking about limits, budget overruns, burn rates, remaining limits)
- "savings" (if asking about goals, target amounts, feasibility, required monthly savings, savings plan)
- "subscriptions" (if asking about recurring payments, cancellation suggestions, subscription cost)
- "forecast" (if asking about future spending predictions, cash flow forecasts, explainable forecast)
- "coach" (if asking general financial health, money coaching, challenges, tips, recommendations)

User Query: "${userMessage}"

Output ONLY a JSON array of string categories.
Example: ["spending", "forecast"]
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an intent classification supervisor. You output ONLY structured JSON arrays.",
                    },
                    {
                        role: "user",
                        content: classificationPrompt,
                    },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            })

            const text = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(text)
            intents = parsed.categories || ["spending", "coach"]
            
            // Ensure at least one intent
            if (intents.length === 0) intents = ["coach"]
            logStep("Routing Decision", `Supervisor routed query to sub-agents: [${intents.join(", ")}]`)
        } catch (error) {
            console.error("Supervisor routing failed, default to spending + coach:", error)
            intents = ["spending", "coach"]
            logStep("Routing Decision (Fallback)", `Routed to default sub-agents: [${intents.join(", ")}]`)
        }

        // Step 2: Retrieve Relevant Memories
        logStep("Memory Retrieval", "Querying AI memory system for relevant user preferences...")
        let memories: AIMemory[] = []
        try {
            memories = await MemoryService.rankMemories(userId, userMessage, 5)
            logStep("Memory Injected", `Retrieved ${memories.length} relevant historical memory facts.`)
        } catch (err) {
            console.error("Failed to load memories:", err)
        }
        const memoriesText = memories.map(m => `- [${m.memory_type}] ${m.memory} (Importance: ${m.importance_score})`).join("\n")

        // Step 3: Run target sub-agents in parallel
        logStep("Parallel Execution", "Invoking selected sub-agents concurrently...")
        const tasks: Promise<AgentResponse>[] = []

        const spendingAgent = new SpendingAnalystAgent()
        const budgetAgent = new BudgetAgent()
        const savingsAgent = new SavingsAgent()
        const subscriptionAgent = new SubscriptionAgent()
        const forecastAgent = new ForecastAgent()
        const coachAgent = new FinancialCoachAgent()

        if (intents.includes("spending")) {
            activeAgents.push(spendingAgent.name)
            tasks.push(spendingAgent.run(userId))
        }
        if (intents.includes("budget")) {
            activeAgents.push(budgetAgent.name)
            tasks.push(budgetAgent.run(userId))
        }
        if (intents.includes("savings")) {
            activeAgents.push(savingsAgent.name)
            tasks.push(savingsAgent.run(userId))
        }
        if (intents.includes("subscriptions")) {
            activeAgents.push(subscriptionAgent.name)
            tasks.push(subscriptionAgent.run(userId))
        }
        if (intents.includes("forecast")) {
            activeAgents.push(forecastAgent.name)
            tasks.push(forecastAgent.run(userId))
        }

        const taskResults = await Promise.all(tasks)

        // Map sub-agent results
        const subAgentData: Record<string, any> = {}
        taskResults.forEach(res => {
            if (res.success) {
                logStep("Agent Completed", `${res.agentName} executed successfully in ${res.executionTime}ms.`)
                if (res.agentName === "Spending Analyst") subAgentData.spending = res.result
                if (res.agentName === "Budget Agent") subAgentData.budget = res.result
                if (res.agentName === "Savings Agent") subAgentData.savings = res.result
                if (res.agentName === "Subscription Agent") subAgentData.subscriptions = res.result
                if (res.agentName === "Forecast Agent") subAgentData.forecast = res.result

                // Log sub-agent execution directly
                supabaseAdmin.from("agent_logs").insert([{
                    user_id: userId,
                    agent_name: res.agentName,
                    action: `Sub-agent trigger: ${userMessage.slice(0, 100)}`,
                    result: { success: true, logs: res.logs, data: res.result },
                    execution_time: res.executionTime
                }]).then(({ error }) => {
                    if (error) console.error(`Error logging ${res.agentName}:`, error)
                })
            } else {
                logStep("Agent Failed", `${res.agentName} failed during execution.`)
            }
        })

        // Run Coach Agent if requested or to consolidate response
        if (intents.includes("coach") || intents.length > 1) {
            logStep("Coach Synthesis", "Invoking Financial Coach to compile custom action tasks...")
            const coachRes = await coachAgent.run(userId, subAgentData)
            if (coachRes.success) {
                subAgentData.coach = coachRes.result
                activeAgents.push(coachAgent.name)
                logStep("Coach Completed", `Financial Coach compiled advice sheet in ${coachRes.executionTime}ms.`)
            }
        }

        // Step 4: Final Synthesis Response
        logStep("Response Synthesis", "Orchestrating final consolidated response using Groq...")
        let finalAnswer = "I am sorry, but I was unable to coordinate my sub-agents. Please try again."
        try {
            const finalPrompt = `
You are the elite AI Financial Copilot. Summarize the diagnostic stats and give a direct answer to the user's message.

User Message: "${userMessage}"

AI Memories (inject this personal context into your advice where appropriate):
${memoriesText || "No historic memories loaded."}

Sub-Agent Diagnostic Payload:
${JSON.stringify(subAgentData, null, 2)}

Instructions:
- Write a premium, personalized, analytical financial response that directly answers the message.
- MOTIVATE savings and budget compliance, highlighting exact numbers from the payload.
- Reference any active budget overruns, savings goal feasibility scores, or forecast warnings if they are present.
- Use neat, modern formatting: bullet points, bold sections, clean paragraphs.
`
            const synthesisCompletion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are the chief AI financial advisor. You provide personalized, data-backed financial coaching based on sub-agent data feeds.",
                    },
                    {
                        role: "user",
                        content: finalPrompt,
                    },
                ],
                temperature: 0.5,
                max_tokens: 1000,
            })

            finalAnswer = synthesisCompletion.choices[0]?.message?.content || finalAnswer
            logStep("Response Completed", "Successfully synthesized executive advice sheet.")
        } catch (error) {
            console.error("Final synthesis failed:", error)
            finalAnswer = "Failed to compile sub-agent outputs. " + (subAgentData.coach?.review || "")
        }

        // Step 5: Check if new facts are disclosed to save to memory
        logStep("Memory Extraction", "Scanning message for any long-term financial facts or goals...")
        try {
            const memoryPrompt = `
Analyze the user message below. Identify if there is a long-term personal financial fact, budget target, or preference mentioned.
Examples of facts to save:
- "I want to save for a Tesla by next year" (type: 'goal', memory: 'Wants to save for a Tesla by next year')
- "My monthly salary is $6000" (type: 'income', memory: 'Salary is $6000/month')
- "I prefer aggressive budgeting" (type: 'preference', memory: 'Prefers aggressive budgeting')
- "I pay $15 for Spotify monthly" (type: 'subscription', memory: 'Pays $15/month for Spotify')

User message: "${userMessage}"

Format your response in EXACTLY this JSON format:
{
  "hasFact": true,
  "memory": "Fact string",
  "memoryType": "preference" | "goal" | "spending_habit" | "income" | "subscription" | "other",
  "importanceScore": 1 to 5 (e.g. major goals/salary = 5, categories/recurring = 2)
}
If no fact is mentioned, set "hasFact" to false. Do NOT output any other text besides the JSON code block.
`
            const memoryCheck = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a fact extraction agent. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: memoryPrompt,
                    },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            })

            const memoryCheckText = memoryCheck.choices[0]?.message?.content || "{}"
            const memoryParsed = JSON.parse(memoryCheckText)

            if (memoryParsed.hasFact && memoryParsed.memory && memoryParsed.memory.trim() !== "") {
                logStep("Memory Capture", `Detected new long-term fact: "${memoryParsed.memory}"`)
                await MemoryService.saveMemory(
                    userId,
                    memoryParsed.memory.trim(),
                    memoryParsed.memoryType || "general",
                    memoryParsed.importanceScore || 1
                )
            }
        } catch (memError) {
            console.error("Fact extraction failed:", memError)
        }

        // Step 6: Log overall orchestrator execution
        const totalTime = Date.now() - startTime
        logStep("Orchestration Finished", `Total coordinated execution finished in ${totalTime}ms.`)

        try {
            await supabaseAdmin.from("agent_logs").insert([{
                user_id: userId,
                agent_name: "FinancialOrchestrator",
                action: userMessage,
                result: {
                    success: true,
                    invokedAgents: activeAgents,
                    timeline,
                    memoriesInjected: memories.map(m => m.memory),
                    subAgentMetrics: {
                        hasSpending: !!subAgentData.spending,
                        hasBudget: !!subAgentData.budget,
                        hasSavings: !!subAgentData.savings,
                        hasSubscriptions: !!subAgentData.subscriptions,
                        hasForecast: !!subAgentData.forecast,
                        hasCoach: !!subAgentData.coach,
                    }
                },
                execution_time: totalTime
            }])
        } catch (logError) {
            console.error("Failed to write supervisor agent execution log:", logError)
        }

        return {
            answer: finalAnswer,
            activeAgents,
            timeline,
            memoriesUsed: memories.map(m => m.memory),
            subAgentData,
        }
    }
}
