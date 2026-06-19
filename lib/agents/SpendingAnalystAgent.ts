import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { BaseAgent, AgentLog, AgentResponse } from "./types"
import { Expense } from "@/types/expense"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface SpendingAnalysisResult {
    monthlySpend: number
    income: number
    savings: number
    changePercentage: number
    growthRates: Array<{ category: string; current: number; previous: number; growth: number }>
    anomalies: Array<{ id: string; category: string; description: string; amount: number; date: string; reason: string }>
    topCategories: Array<{ category: string; amount: number; percentage: number }>
    recommendations: string[]
    alerts: string[]
}

export class SpendingAnalystAgent implements BaseAgent<SpendingAnalysisResult> {
    name = "Spending Analyst"
    description = "Analyzes spending habits, calculates category growth, and flags statistical spending anomalies."

    async run(userId: string): Promise<AgentResponse<SpendingAnalysisResult>> {
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
            logStep("Database Query", "Fetching user transactions for the last 60 days...")
            const now = new Date()
            const startOf60DaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60).toISOString().split("T")[0]

            const { data: expensesData, error } = await supabaseAdmin
                .from("expenses")
                .select("*")
                .eq("user_id", userId)
                .gte("date", startOf60DaysAgo)

            if (error) throw error

            const allExpenses = (expensesData || []) as Expense[]
            logStep("Data Filtering", `Loaded ${allExpenses.length} transactions from the database.`)

            // Split into current month vs previous month
            const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

            const currentMonthTransactions = allExpenses.filter(e => new Date(e.date) >= startOfCurrentMonth)
            const previousMonthTransactions = allExpenses.filter(e => new Date(e.date) >= startOfPreviousMonth && new Date(e.date) < startOfCurrentMonth)

            logStep("Metrics Computation", "Computing base spending stats and monthly differentials...")

            const currentSpend = currentMonthTransactions.filter(e => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0)
            const currentIncome = currentMonthTransactions.filter(e => e.type === "income").reduce((s, e) => s + Number(e.amount), 0)
            
            const previousSpend = previousMonthTransactions.filter(e => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0)

            const changePercentage = previousSpend > 0 
                ? parseFloat((((currentSpend - previousSpend) / previousSpend) * 100).toFixed(1)) 
                : currentSpend > 0 ? 100 : 0

            // Growth by category
            logStep("Growth Rate Calculation", "Analyzing category growth rates month-over-month...")
            const currentCategorySpend: Record<string, number> = {}
            const previousCategorySpend: Record<string, number> = {}

            currentMonthTransactions.filter(e => e.type === "expense").forEach(e => {
                currentCategorySpend[e.category] = (currentCategorySpend[e.category] || 0) + Number(e.amount)
            })

            previousMonthTransactions.filter(e => e.type === "expense").forEach(e => {
                previousCategorySpend[e.category] = (previousCategorySpend[e.category] || 0) + Number(e.amount)
            })

            const growthRates = Object.keys({ ...currentCategorySpend, ...previousCategorySpend }).map(category => {
                const current = currentCategorySpend[category] || 0
                const previous = previousCategorySpend[category] || 0
                let growth = 0
                if (previous > 0) {
                    growth = parseFloat((((current - previous) / previous) * 100).toFixed(1))
                } else if (current > 0) {
                    growth = 100
                }
                return { category, current, previous, growth }
            }).sort((a, b) => b.growth - a.growth)

            // Anomaly Detection
            logStep("Anomaly Detection", "Scanning transactions for statistical anomalies...")
            const expensesOnly = allExpenses.filter(e => e.type === "expense")
            const amounts = expensesOnly.map(e => Number(e.amount))
            const anomalies: SpendingAnalysisResult["anomalies"] = []

            if (amounts.length > 3) {
                const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length
                const variance = amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length
                const stdDev = Math.sqrt(variance)

                // Anomaly defined as > mean + 2 * stdDev OR absolute value > $800
                expensesOnly.forEach(e => {
                    const amount = Number(e.amount)
                    if (amount > mean + 2.5 * stdDev && amount > 100) {
                        anomalies.push({
                            id: e.id,
                            category: e.category,
                            description: e.description,
                            amount,
                            date: e.date,
                            reason: `Statistical spike: This purchase is ${((amount - mean) / stdDev).toFixed(1)} standard deviations above your average expense of $${mean.toFixed(1)}.`
                        })
                    } else if (amount > 800) {
                        anomalies.push({
                            id: e.id,
                            category: e.category,
                            description: e.description,
                            amount,
                            date: e.date,
                            reason: `Large transaction alert: Single purchase exceeds $800.`
                        })
                    }
                })
            }

            // Top categories
            const topCategories = Object.entries(currentCategorySpend)
                .map(([category, amount]) => ({
                    category,
                    amount,
                    percentage: currentSpend > 0 ? parseFloat(((amount / currentSpend) * 100).toFixed(1)) : 0
                }))
                .sort((a, b) => b.amount - a.amount)

            // Leverage LLM for qualitative insights
            logStep("AI Reasoning", "Synthesizing qualitative spending insights using Llama-3.3...")
            const synthesisPrompt = `
You are the Spending Analyst sub-agent of an elite financial copilot.
Analyze this pre-computed statistical spending breakdown for the user:

Current Month Spent: $${currentSpend}
Previous Month Spent: $${previousSpend}
Month-over-Month Change: ${changePercentage}%
Top Spending Categories:
${topCategories.map(c => `- ${c.category}: $${c.amount} (${c.percentage}%)`).join("\n")}

Growth MoM Rates:
${growthRates.slice(0, 3).map(g => `- ${g.category}: from $${g.previous} to $${g.current} (${g.growth}% growth)`).join("\n")}

Anomalies Detected:
${anomalies.map(a => `- $${a.amount} in ${a.category} (${a.description}): ${a.reason}`).join("\n")}

Format your response in EXACTLY this JSON format:
{
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "alerts": ["Key warning alert 1", "Key warning alert 2"]
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an analytical financial advisor sub-agent. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: synthesisPrompt,
                    },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            logStep("Synthesis Completed", "Successfully generated recommendations and spending warnings.")

            const result: SpendingAnalysisResult = {
                monthlySpend: currentSpend,
                income: currentIncome,
                savings: currentIncome - currentSpend,
                changePercentage,
                growthRates,
                anomalies,
                topCategories,
                recommendations: parsed.recommendations || [],
                alerts: parsed.alerts || [],
            }

            return {
                agentName: this.name,
                success: true,
                result,
                logs,
                executionTime: Date.now() - startTime,
            }
        } catch (error: any) {
            console.error("SpendingAnalystAgent run error:", error)
            logStep("Error Encountered", error.message || String(error))
            return {
                agentName: this.name,
                success: false,
                result: {
                    monthlySpend: 0,
                    income: 0,
                    savings: 0,
                    changePercentage: 0,
                    growthRates: [],
                    anomalies: [],
                    topCategories: [],
                    recommendations: ["Error analyzing spending details. Please try again."],
                    alerts: [],
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        }
    }
}
