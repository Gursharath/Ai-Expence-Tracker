import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { Expense } from "@/types/expense"
import { Budget } from "@/types/budget"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export class SpendingAgent {
    // 1. Analyze Monthly Spending
    static async analyzeMonthlySpending(userId: string) {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

        const { data: expenses, error } = await supabaseAdmin
            .from("expenses")
            .select("*")
            .eq("user_id", userId)
            .gte("date", startOfMonth)

        if (error) throw error

        const expenseList = expenses as Expense[]
        const totalExpenses = expenseList
            .filter((e) => e.type === "expense")
            .reduce((sum, e) => sum + Number(e.amount), 0)

        const totalIncome = expenseList
            .filter((e) => e.type === "income")
            .reduce((sum, e) => sum + Number(e.amount), 0)

        return {
            totalExpenses,
            totalIncome,
            netSavings: totalIncome - totalExpenses,
            rawTransactionsCount: expenseList.length,
        }
    }

    // 2. Compare Periods (Current Month vs Previous Month)
    static async comparePeriods(userId: string) {
        const now = new Date()
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const startOfCurrentMonthStr = startOfCurrentMonth.toISOString().split("T")[0]
        const startOfPreviousMonthStr = startOfPreviousMonth.toISOString().split("T")[0]

        const { data: expenses, error } = await supabaseAdmin
            .from("expenses")
            .select("*")
            .eq("user_id", userId)
            .gte("date", startOfPreviousMonthStr)

        if (error) throw error

        const expenseList = expenses as Expense[]

        const currentExpenses = expenseList
            .filter((e) => e.type === "expense" && new Date(e.date) >= startOfCurrentMonth)
            .reduce((sum, e) => sum + Number(e.amount), 0)

        const previousExpenses = expenseList
            .filter((e) => e.type === "expense" && new Date(e.date) >= startOfPreviousMonth && new Date(e.date) < startOfCurrentMonth)
            .reduce((sum, e) => sum + Number(e.amount), 0)

        const changePercentage = previousExpenses > 0 
            ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
            : currentExpenses > 0 ? 100 : 0

        return {
            currentMonthSpend: currentExpenses,
            previousMonthSpend: previousExpenses,
            changePercentage: parseFloat(changePercentage.toFixed(1)),
        }
    }

    // 3. Get Top Categories
    static async getTopCategories(userId: string) {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

        const { data: expenses, error } = await supabaseAdmin
            .from("expenses")
            .select("*")
            .eq("user_id", userId)
            .eq("type", "expense")
            .gte("date", startOfMonth)

        if (error) throw error

        const expenseList = expenses as Expense[]
        const total = expenseList.reduce((sum, e) => sum + Number(e.amount), 0)

        const categories: Record<string, number> = {}
        expenseList.forEach((e) => {
            categories[e.category] = (categories[e.category] || 0) + Number(e.amount)
        })

        const sorted = Object.entries(categories)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: total > 0 ? parseFloat(((amount / total) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.amount - a.amount)

        return sorted
    }

    // 4. Detect Overspending Patterns (Against Budgets)
    static async detectOverspending(userId: string) {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

        // Load budgets
        const { data: budgetsData, error: budgetError } = await supabaseAdmin
            .from("budgets")
            .select("*")
            .eq("user_id", userId)

        if (budgetError) throw budgetError
        const budgets = budgetsData as Budget[]

        // Load expenses
        const { data: expensesData, error: expenseError } = await supabaseAdmin
            .from("expenses")
            .select("*")
            .eq("user_id", userId)
            .eq("type", "expense")
            .gte("date", startOfMonth)

        if (expenseError) throw expenseError
        const expenses = expensesData as Expense[]

        // Aggregate actual spending per category
        const categorySpend: Record<string, number> = {}
        expenses.forEach((e) => {
            categorySpend[e.category] = (categorySpend[e.category] || 0) + Number(e.amount)
        })

        const overspendings = []

        for (const budget of budgets) {
            const spent = categorySpend[budget.category] || 0
            if (spent > budget.monthly_limit) {
                overspendings.push({
                    category: budget.category,
                    limit: Number(budget.monthly_limit),
                    spent,
                    overAmount: spent - Number(budget.monthly_limit),
                    overPercentage: parseFloat((((spent - Number(budget.monthly_limit)) / Number(budget.monthly_limit)) * 100).toFixed(1)),
                })
            }
        }

        return overspendings
    }

    // 5. Detect Recurring Subscriptions
    static async detectSubscriptions(userId: string) {
        // Find expenses flagged as recurring, or run an analysis
        const { data: expenses, error } = await supabaseAdmin
            .from("expenses")
            .select("*")
            .eq("user_id", userId)
            .eq("type", "expense")

        if (error) throw error
        const expenseList = expenses as Expense[]

        // Subscriptions explicitly marked or occurring monthly with same amount/description
        const markedSubscriptions = expenseList.filter((e) => e.is_recurring)
        
        // Group by description and check recurring intervals
        const groups: Record<string, Expense[]> = {}
        expenseList.forEach((e) => {
            const key = `${e.description.trim().toLowerCase()}_${Number(e.amount)}`
            groups[key] = groups[key] || []
            groups[key].push(e)
        })

        const detectedSubscriptions: Array<{ description: string; amount: number; frequency: string }> = []
        
        // Take explicitly marked
        markedSubscriptions.forEach((sub) => {
            if (!detectedSubscriptions.some(d => d.description.toLowerCase() === sub.description.toLowerCase())) {
                detectedSubscriptions.push({
                    description: sub.description,
                    amount: Number(sub.amount),
                    frequency: "Monthly",
                })
            }
        })

        // Add heuristically detected monthly duplicates (appearing in multiple dates)
        Object.values(groups).forEach((group) => {
            if (group.length >= 2) {
                const dates = group.map((e) => new Date(e.date).getTime()).sort((a, b) => a - b)
                // Check if approximate difference is ~30 days (between 25 and 35 days)
                let isMonthly = false
                for (let i = 1; i < dates.length; i++) {
                    const diffDays = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24)
                    if (diffDays >= 25 && diffDays <= 35) {
                        isMonthly = true
                        break
                    }
                }

                if (isMonthly) {
                    const representative = group[0]
                    if (!detectedSubscriptions.some(d => d.description.toLowerCase() === representative.description.toLowerCase())) {
                        detectedSubscriptions.push({
                            description: representative.description,
                            amount: Number(representative.amount),
                            frequency: "Monthly (Heuristic)",
                        })
                    }
                }
            }
        })

        return detectedSubscriptions;
    }

    // 6. Generate Actionable Financial Insights (using Groq Llama 3.3)
    static async generateInsights(userId: string) {
        try {
            const monthlyStats = await this.analyzeMonthlySpending(userId)
            const periodStats = await this.comparePeriods(userId)
            const topCategories = await this.getTopCategories(userId)
            const overspendings = await this.detectOverspending(userId)
            const subscriptions = await this.detectSubscriptions(userId)

            const analysisSummary = {
                monthlySpend: monthlyStats.totalExpenses,
                income: monthlyStats.totalIncome,
                savings: monthlyStats.netSavings,
                changePercentage: periodStats.changePercentage,
                topCategories: topCategories.slice(0, 3),
                overspendingAlerts: overspendings,
                subscriptionsDetectedCount: subscriptions.length,
            }

            const prompt = `
You are a senior AI Financial Copilot. Generate a professional spending analysis summary for the user.
Here is the user's spending data:
${JSON.stringify(analysisSummary, null, 2)}

Provide your response in EXACTLY this JSON format:
{
  "recommendations": ["Recommendation 1 string", "Recommendation 2 string"],
  "alerts": ["Alert 1 string", "Alert 2 string"]
}

Rules:
- Be highly analytical, modern, and practical.
- Recommendations must be concrete actions (e.g., "Cancel the duplicate $15 Netflix subscription to save $180/year").
- Alerts should flag actual budget overruns or rapid increases in spending.
- Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a senior AI financial advisor. You output ONLY structured JSON matching the requested schema.",
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
                monthlySpend: monthlyStats.totalExpenses,
                changePercentage: periodStats.changePercentage,
                topCategories: topCategories,
                recommendations: parsed.recommendations || [],
                alerts: parsed.alerts || [],
                subscriptions
            }
        } catch (error) {
            console.error("SpendingAgent generateInsights failed, falling back:", error)
            const monthlyStats = await this.analyzeMonthlySpending(userId)
            const periodStats = await this.comparePeriods(userId)
            const topCategories = await this.getTopCategories(userId)
            return {
                monthlySpend: monthlyStats.totalExpenses,
                changePercentage: periodStats.changePercentage,
                topCategories: topCategories,
                recommendations: [
                    "Review your top spending categories for potential savings opportunities.",
                    "Track transactions daily to identify immediate areas for cost cutting."
                ],
                alerts: [],
                subscriptions: []
            }
        }
    }
}
