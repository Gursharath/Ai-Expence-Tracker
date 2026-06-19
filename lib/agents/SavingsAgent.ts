import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { BaseAgent, AgentLog, AgentResponse } from "./types"
import { Goal } from "@/types/goal"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface SavingsAnalysisResult {
    goals: Array<{
        id: string
        title: string
        targetAmount: number
        currentAmount: number
        remaining: number
        progressPercentage: number
        targetDate: string
        requiredMonthlySavings: number
    }>
    totalRequiredMonthly: number
    currentMonthlySavings: number
    savingsDeficit: number
    feasibilityScore: number
    recommendations: string[]
}

export class SavingsAgent implements BaseAgent<SavingsAnalysisResult> {
    name = "Savings Agent"
    description = "Tracks savings targets, computes required monthly savings, measures goal feasibility, and plans saving paths."

    async run(userId: string): Promise<AgentResponse<SavingsAnalysisResult>> {
        const startTime = Date.now()
        const logs: AgentLog[] = []

        const logStep = (action: string, detail: string) => {
            logs.push({
                timestamp: new Date().toISOString(),
                action,
                detail,
            })
        }

        try {
            logStep("Database Query", "Loading active savings goals and current month cash flow...")
            const now = new Date()
            
            // 1. Load active goals
            const { data: goalsData, error: goalsError } = await supabaseAdmin
                .from("goals")
                .select("*")
                .eq("user_id", userId)
                .eq("status", "active")

            if (goalsError) throw goalsError
            const goals = (goalsData || []) as Goal[]
            logStep("Goal Processing", `Found ${goals.length} active savings goals.`)

            // 2. Fetch current month expenses to find actual net savings rate
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
            const { data: expensesData, error: expensesError } = await supabaseAdmin
                .from("expenses")
                .select("amount, type")
                .eq("user_id", userId)
                .gte("date", startOfMonth)

            if (expensesError) throw expensesError
            
            const transactions = expensesData || []
            const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
            const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)
            const currentMonthlySavings = income - expense

            logStep("Savings Rate Evaluation", `Current month cash flow: Income $${income}, Expenses $${expense}, Net Savings $${currentMonthlySavings}.`)

            // 3. Compute goals metrics
            const today = new Date()
            const goalsProgress = goals.map((goal) => {
                const currentAmount = Number(goal.current_amount || 0)
                const targetAmount = Number(goal.target_amount)
                const remaining = targetAmount - currentAmount
                const progressPercentage = targetAmount > 0 ? parseFloat(((currentAmount / targetAmount) * 100).toFixed(1)) : 0

                // Calc remaining months
                const targetDate = new Date(goal.target_date)
                let months = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth())
                if (months <= 0) months = 1

                const requiredMonthlySavings = remaining > 0 ? parseFloat((remaining / months).toFixed(1)) : 0

                return {
                    id: goal.id || "",
                    title: goal.title,
                    targetAmount,
                    currentAmount,
                    remaining,
                    progressPercentage,
                    targetDate: goal.target_date,
                    requiredMonthlySavings,
                }
            })

            const totalRequiredMonthly = goalsProgress.reduce((sum, g) => sum + g.requiredMonthlySavings, 0)
            const savingsDeficit = Math.max(0, totalRequiredMonthly - currentMonthlySavings)
            
            // Heuristic feasibility score: how close are we to meeting required savings?
            let feasibilityScore = 100
            if (totalRequiredMonthly > 0) {
                if (currentMonthlySavings <= 0) {
                    feasibilityScore = 10; // Low score if not saving anything
                } else {
                    feasibilityScore = Math.min(100, Math.round((currentMonthlySavings / totalRequiredMonthly) * 100))
                }
            }

            logStep("AI Savings Strategy", "Drafting goals feasibility analysis and savings adjustments with Groq...")
            const savingsPrompt = `
You are the Savings Agent sub-agent of an elite financial copilot.
Assess the user's progress towards their goals.

User's Active Goals:
${goalsProgress.map(g => `- ${g.title}: Target $${g.targetAmount}, Saved $${g.currentAmount} (${g.progressPercentage}%), Required: $${g.requiredMonthlySavings}/mo by ${g.targetDate}`).join("\n")}

Current actual monthly savings rate: $${currentMonthlySavings}
Total required monthly savings to meet all goals: $${totalRequiredMonthly}
Savings Deficit: $${savingsDeficit}
Initial Feasibility Score: ${feasibilityScore}/100

Format your response in EXACTLY this JSON format:
{
  "recommendations": [
    "Strategy details to achieve goals...",
    "Budget trimming suggestions to address deficit..."
  ],
  "feasibilityScore": 75
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a financial savings planner. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: savingsPrompt,
                    },
                ],
                temperature: 0.3,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            logStep("Processing Completed", "Calculated requirements and saving strategies successfully.")

            const result: SavingsAnalysisResult = {
                goals: goalsProgress,
                totalRequiredMonthly,
                currentMonthlySavings,
                savingsDeficit,
                feasibilityScore: parsed.feasibilityScore !== undefined ? parsed.feasibilityScore : feasibilityScore,
                recommendations: parsed.recommendations || [],
            }

            return {
                agentName: this.name,
                success: true,
                result,
                logs,
                executionTime: Date.now() - startTime,
            }
        } catch (error: any) {
            console.error("SavingsAgent run error:", error)
            logStep("Error Encountered", error.message || String(error))
            return {
                agentName: this.name,
                success: false,
                result: {
                    goals: [],
                    totalRequiredMonthly: 0,
                    currentMonthlySavings: 0,
                    savingsDeficit: 0,
                    feasibilityScore: 0,
                    recommendations: ["Error analyzing savings goals. Please try again."],
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        }
    }
}
