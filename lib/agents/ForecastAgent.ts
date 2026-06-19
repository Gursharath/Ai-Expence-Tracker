import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { BaseAgent, AgentLog, AgentResponse } from "./types"
import { Expense } from "@/types/expense"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface CategoryForecast {
    category: string
    predictedAmount: number
    reasons: string[]
}

export interface ForecastAnalysisResult {
    predictedSpending: number
    predictedCashFlow: number
    categoryForecasts: CategoryForecast[]
    reasoningMarkdown: string
}

export class ForecastAgent implements BaseAgent<ForecastAnalysisResult> {
    name = "Forecast Agent"
    description = "Predicts future monthly expenses and category spending using regression models, providing clear explanations."

    async run(userId: string): Promise<AgentResponse<ForecastAnalysisResult>> {
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
            logStep("Database Query", "Loading user transaction history for the past 90 days...")
            const now = new Date()
            const startOf90DaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90).toISOString().split("T")[0]

            const { data: expensesData, error } = await supabaseAdmin
                .from("expenses")
                .select("*")
                .eq("user_id", userId)
                .gte("date", startOf90DaysAgo)

            if (error) throw error
            const allExpenses = (expensesData || []) as Expense[]
            logStep("Data Aggregation", `Loaded ${allExpenses.length} transactions. Grouping by calendar month...`)

            // Group transactions by month index
            const currentMonthIdx = now.getMonth()
            const prevMonthIdx = (currentMonthIdx - 1 + 12) % 12
            const twoMonthsAgoIdx = (currentMonthIdx - 2 + 12) % 12

            const currentExpenses = allExpenses.filter(e => new Date(e.date).getMonth() === currentMonthIdx && e.type === "expense")
            const prevExpenses = allExpenses.filter(e => new Date(e.date).getMonth() === prevMonthIdx && e.type === "expense")
            const twoAgoExpenses = allExpenses.filter(e => new Date(e.date).getMonth() === twoMonthsAgoIdx && e.type === "expense")

            const currentIncomeList = allExpenses.filter(e => new Date(e.date).getMonth() === currentMonthIdx && e.type === "income")
            const prevIncomeList = allExpenses.filter(e => new Date(e.date).getMonth() === prevMonthIdx && e.type === "income")

            // Calculate totals
            const currentSpent = currentExpenses.reduce((s, e) => s + Number(e.amount), 0)
            const prevSpent = prevExpenses.reduce((s, e) => s + Number(e.amount), 0)
            const twoAgoSpent = twoAgoExpenses.reduce((s, e) => s + Number(e.amount), 0)

            const currentIncome = currentIncomeList.reduce((s, e) => s + Number(e.amount), 0)
            const prevIncome = prevIncomeList.reduce((s, e) => s + Number(e.amount), 0)

            logStep("Statistical Forecasting", "Running simple trend extrapolation and average weighting...")
            // Base projection: weight current month 50%, previous month 30%, two months ago 20%
            let projectedSpend = currentSpent
            if (prevSpent > 0 && twoAgoSpent > 0) {
                projectedSpend = parseFloat((currentSpent * 0.5 + prevSpent * 0.3 + twoAgoSpent * 0.2).toFixed(2))
            } else if (prevSpent > 0) {
                projectedSpend = parseFloat((currentSpent * 0.6 + prevSpent * 0.4).toFixed(2))
            }

            const projectedIncome = currentIncome > 0 ? currentIncome : (prevIncome > 0 ? prevIncome : 0)
            const projectedCashFlow = parseFloat((projectedIncome - projectedSpend).toFixed(2))

            // Group by category to project category spending
            const categorySpends: Record<string, { current: number; prev: number }> = {}
            currentExpenses.forEach(e => {
                categorySpends[e.category] = categorySpends[e.category] || { current: 0, prev: 0 }
                categorySpends[e.category].current += Number(e.amount)
            })
            prevExpenses.forEach(e => {
                categorySpends[e.category] = categorySpends[e.category] || { current: 0, prev: 0 }
                categorySpends[e.category].prev += Number(e.amount)
            })

            const categoryProjections = Object.entries(categorySpends).map(([category, data]) => {
                let growth = 0
                if (data.prev > 0) {
                    growth = (data.current - data.prev) / data.prev
                }
                // Cap growth multiplier at +50% and -50% for projection safety
                const multiplier = Math.min(1.5, Math.max(0.5, 1 + growth))
                const predictedAmount = parseFloat((data.current * multiplier).toFixed(1))
                return { category, current: data.current, prev: data.prev, predictedAmount }
            })

            logStep("AI Reasoning Pass", "Querying Groq to formulate explainable projections...")
            const forecastPrompt = `
You are the Forecast Agent sub-agent of an elite financial copilot.
Generate an explainable monthly spending forecast for the next month based on historical data.

Historical Metrics:
- Current Month Spent: $${currentSpent} (Income: $${currentIncome})
- Previous Month Spent: $${prevSpent}
- Two Months Ago Spent: $${twoAgoSpent}

Category Projections:
${categoryProjections.map(c => `- ${c.category}: Current Spent $${c.current}, Previous Spent $${c.prev}. Extrapolated prediction: $${c.predictedAmount}`).join("\n")}

For every category prediction, explain the reasoning (e.g. "Food spending has an upward trend (+12% growth) due to dining out", "Subscriptions remain steady", "Entertainment shows seasonal inflation").

Format your response in EXACTLY this JSON format:
{
  "predictedSpending": 25000,
  "predictedCashFlow": 5000,
  "categoryForecasts": [
    {
      "category": "Food",
      "predictedAmount": 450,
      "reasons": [
        "Food spending increased by 12% MoM",
        "Upcoming weekend dining events"
      ]
    }
  ],
  "reasoningMarkdown": "Markdown summary of the overall cash flow and category forecast."
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a forecasting financial advisor. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: forecastPrompt,
                    },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            logStep("Forecasting Completed", "Explainable predictions successfully generated.")

            const finalResult: ForecastAnalysisResult = {
                predictedSpending: parsed.predictedSpending || projectedSpend,
                predictedCashFlow: parsed.predictedCashFlow || projectedCashFlow,
                categoryForecasts: parsed.categoryForecasts || categoryProjections.map(c => ({
                    category: c.category,
                    predictedAmount: c.predictedAmount,
                    reasons: ["Based on weighted linear trend of recent transaction volume."]
                })),
                reasoningMarkdown: parsed.reasoningMarkdown || "Predictions represent standard linear extrapolation of recent transactions.",
            }

            return {
                agentName: this.name,
                success: true,
                result: finalResult,
                logs,
                executionTime: Date.now() - startTime,
            }
        } catch (error: any) {
            console.error("ForecastAgent run error:", error)
            logStep("Error Encountered", error.message || String(error))
            return {
                agentName: this.name,
                success: false,
                result: {
                    predictedSpending: 0,
                    predictedCashFlow: 0,
                    categoryForecasts: [],
                    reasoningMarkdown: "Error compiling predictions model. Please check transaction history.",
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        }
    }
}
