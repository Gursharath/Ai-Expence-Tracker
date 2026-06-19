import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { BaseAgent, AgentLog, AgentResponse } from "./types"
import { Expense } from "@/types/expense"
import { Budget } from "@/types/budget"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface BudgetAnalysisResult {
    totalBudgetLimit: number
    totalSpent: number
    remainingBudget: number
    utilizationPercentage: number
    categoryBudgets: Array<{
        categoryId: string
        category: string
        limit: number
        spent: number
        remaining: number
        utilizationPercentage: number
    }>
    overrunRisks: Array<{
        category: string
        limit: number
        currentSpent: number
        projectedSpend: number
        projectedOverrun: number
        daysRemaining: number
    }>
    suggestions: string[]
    reallocations: Array<{
        fromCategory: string
        toCategory: string
        amount: number
        reason: string
    }>
}

export class BudgetAgent implements BaseAgent<BudgetAnalysisResult> {
    name = "Budget Agent"
    description = "Checks category limits, detects overruns, predicts future budget breaches, and advises on reallocations."

    async run(userId: string): Promise<AgentResponse<BudgetAnalysisResult>> {
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
            logStep("Database Query", "Loading budget rules and current month expenses...")
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

            const { data: budgetsData, error: budgetError } = await supabaseAdmin
                .from("budgets")
                .select("*")
                .eq("user_id", userId)

            if (budgetError) throw budgetError
            const budgets = (budgetsData || []) as Budget[]

            const { data: expensesData, error: expenseError } = await supabaseAdmin
                .from("expenses")
                .select("*")
                .eq("user_id", userId)
                .eq("type", "expense")
                .gte("date", startOfMonth)

            if (expenseError) throw expenseError
            const expenses = (expensesData || []) as Expense[]

            logStep("Budget Calculation", `Fetched ${budgets.length} budgets and ${expenses.length} current month expenses.`)

            const categorySpent: Record<string, number> = {}
            expenses.forEach((e) => {
                categorySpent[e.category] = (categorySpent[e.category] || 0) + Number(e.amount)
            })

            const categoryBudgets = budgets.map((b) => {
                const spent = categorySpent[b.category] || 0
                const limit = Number(b.monthly_limit)
                const remaining = limit - spent
                const utilization = limit > 0 ? parseFloat(((spent / limit) * 100).toFixed(1)) : 0

                return {
                    categoryId: b.id,
                    category: b.category,
                    limit,
                    spent,
                    remaining,
                    utilizationPercentage: utilization,
                }
            })

            const totalBudgetLimit = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0)
            const totalSpent = Object.values(categorySpent).reduce((sum, amt) => sum + amt, 0)
            const remainingBudget = totalBudgetLimit - totalSpent
            const utilizationPercentage = totalBudgetLimit > 0 ? parseFloat(((totalSpent / totalBudgetLimit) * 100).toFixed(1)) : 0

            // Predict overruns using daily burn rates
            logStep("Overrun Forecasting", "Computing daily burn rate and projecting end-of-month budget statuses...")
            const currentDay = now.getDate()
            const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
            const daysRemaining = totalDaysInMonth - currentDay

            const overrunRisks: BudgetAnalysisResult["overrunRisks"] = []

            categoryBudgets.forEach((cb) => {
                if (cb.spent > 0 && cb.limit > 0) {
                    const dailyBurnRate = cb.spent / currentDay
                    const projectedSpend = dailyBurnRate * totalDaysInMonth

                    if (projectedSpend > cb.limit) {
                        overrunRisks.push({
                            category: cb.category,
                            limit: cb.limit,
                            currentSpent: cb.spent,
                            projectedSpend: parseFloat(projectedSpend.toFixed(1)),
                            projectedOverrun: parseFloat((projectedSpend - cb.limit).toFixed(1)),
                            daysRemaining,
                        })
                    }
                }
            })

            logStep("AI Optimization", "Querying Groq to structure budget limit reallocation advice...")
            const allocationPrompt = `
You are the Budget Agent sub-agent of an elite financial copilot.
Your job is to optimize category limits based on spending pace.

Current Budget Stats:
Total Limit: $${totalBudgetLimit}
Total Spent: $${totalSpent}
Category Budgets:
${categoryBudgets.map(cb => `- ${cb.category}: Limit $${cb.limit}, Spent $${cb.spent} (${cb.utilizationPercentage}% utilized)`).join("\n")}

Predicted Overruns:
${overrunRisks.map(or => `- ${or.category}: Projected to exceed limit by $${or.projectedOverrun} (Projected: $${or.projectedSpend} vs Limit: $${or.limit})`).join("\n")}

Suggest adjustments. If a category is under-utilized and another is overrunning, recommend shifting a specific limit amount (e.g. from Entertainment to Food).

Format your response in EXACTLY this JSON format:
{
  "suggestions": [
    "Suggestion 1 details...",
    "Suggestion 2 details..."
  ],
  "reallocations": [
    {
      "fromCategory": "UnderUtilizedCategory",
      "toCategory": "OverrunningCategory",
      "amount": 100,
      "reason": "Explain reason here"
    }
  ]
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert AI budget optimizer. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: allocationPrompt,
                    },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            logStep("Processing Complete", "Finished checking overruns and calculating allocation plans.")

            const result: BudgetAnalysisResult = {
                totalBudgetLimit,
                totalSpent,
                remainingBudget,
                utilizationPercentage,
                categoryBudgets,
                overrunRisks,
                suggestions: parsed.suggestions || [],
                reallocations: parsed.reallocations || [],
            }

            return {
                agentName: this.name,
                success: true,
                result,
                logs,
                executionTime: Date.now() - startTime,
            }
        } catch (error: any) {
            console.error("BudgetAgent run error:", error)
            logStep("Error Encountered", error.message || String(error))
            return {
                agentName: this.name,
                success: false,
                result: {
                    totalBudgetLimit: 0,
                    totalSpent: 0,
                    remainingBudget: 0,
                    utilizationPercentage: 0,
                    categoryBudgets: [],
                    overrunRisks: [],
                    suggestions: ["Error loading budget suggestions. Please try again."],
                    reallocations: [],
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        }
    }
}
