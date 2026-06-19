import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { Expense } from "@/types/expense"
import { Budget } from "@/types/budget"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export class BudgetAgent {
    // 1. Analyze Budgets (Actual Spent vs Limits)
    static async analyzeBudgets(userId: string) {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

        // Load budgets & expenses
        const { data: budgetsData, error: budgetError } = await supabaseAdmin
            .from("budgets")
            .select("*")
            .eq("user_id", userId)

        if (budgetError) throw budgetError
        const budgets = budgetsData as Budget[]

        const { data: expensesData, error: expenseError } = await supabaseAdmin
            .from("expenses")
            .select("*")
            .eq("user_id", userId)
            .eq("type", "expense")
            .gte("date", startOfMonth)

        if (expenseError) throw expenseError
        const expenses = expensesData as Expense[]

        const categorySpent: Record<string, number> = {}
        expenses.forEach((e) => {
            categorySpent[e.category] = (categorySpent[e.category] || 0) + Number(e.amount)
        })

        const budgetSummaries = budgets.map((b) => {
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

        return {
            totalBudgetLimit,
            totalSpent,
            remainingBudget,
            utilizationPercentage,
            categoryBudgets: budgetSummaries,
        }
    }

    // 2. Get Remaining Budget per category
    static async getRemainingBudget(userId: string) {
        const analysis = await this.analyzeBudgets(userId)
        return analysis.categoryBudgets.map((cb) => ({
            category: cb.category,
            remaining: cb.remaining,
            utilization: cb.utilizationPercentage,
        }))
    }

    // 3. Predict Overruns based on current burn rate
    static async predictOverruns(userId: string) {
        const analysis = await this.analyzeBudgets(userId)
        const now = new Date()
        const currentDay = now.getDate()
        const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

        const overruns = []

        for (const cb of analysis.categoryBudgets) {
            if (cb.spent === 0 || cb.limit === 0) continue

            // Burn rate = spent so far / current day
            const dailyBurnRate = cb.spent / currentDay
            // Project end-of-month spending
            const projectedSpend = dailyBurnRate * totalDaysInMonth

            if (projectedSpend > cb.limit) {
                overruns.push({
                    category: cb.category,
                    limit: cb.limit,
                    currentSpent: cb.spent,
                    projectedSpend: parseFloat(projectedSpend.toFixed(1)),
                    projectedOverrun: parseFloat((projectedSpend - cb.limit).toFixed(1)),
                    daysRemaining: totalDaysInMonth - currentDay,
                })
            }
        }

        return overruns
    }

    // 4. Generate suggestions for reallocating budget limits (AI structured)
    static async generateBudgetSuggestions(userId: string) {
        try {
            const budgetAnalysis = await this.analyzeBudgets(userId)
            const projectedOverruns = await this.predictOverruns(userId)

            const prompt = `
You are an AI Budget Planner Agent. Help the user optimize their budgets.
Here is the current budget status:
${JSON.stringify(budgetAnalysis, null, 2)}

Here are the predicted overruns:
${JSON.stringify(projectedOverruns, null, 2)}

Provide your suggestions in EXACTLY this JSON format:
{
  "suggestions": [
    "Suggestion 1 details...",
    "Suggestion 2 details..."
  ],
  "reallocations": [
    {
      "fromCategory": "CategoryName",
      "toCategory": "CategoryName",
      "amount": 150,
      "reason": "Reason details..."
    }
  ]
}

Rules:
- If a category is under-utilized (utilization is low relative to the current day of the month) and another category is projected to overrun, recommend reallocating a portion of the limit.
- If there are no overruns, suggest adjustments to increase savings rates.
- Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI budget advisor. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            return {
                suggestions: parsed.suggestions || [],
                reallocations: parsed.reallocations || [],
            }
        } catch (error) {
            console.error("BudgetAgent generateBudgetSuggestions failed, falling back:", error)
            return {
                suggestions: [
                    "Reallocate unused limits from Entertainment to Food to prevent category overruns.",
                    "Review high spending items to keep monthly expenses under control."
                ],
                reallocations: []
            }
        }
    }

    // Unified helper for Supervisor Copilot
    static async runAgent(userId: string) {
        const budgetsSummary = await this.analyzeBudgets(userId)
        const overruns = await this.predictOverruns(userId)
        const suggestions = await this.generateBudgetSuggestions(userId)

        return {
            totalBudgetLimit: budgetsSummary.totalBudgetLimit,
            totalSpent: budgetsSummary.totalSpent,
            utilizationPercentage: budgetsSummary.utilizationPercentage,
            remainingBudget: budgetsSummary.remainingBudget,
            overrunRisks: overruns,
            suggestions: suggestions.suggestions,
            reallocations: suggestions.reallocations,
            categoryBudgets: budgetsSummary.categoryBudgets
        }
    }
}
