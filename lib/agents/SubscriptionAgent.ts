import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { BaseAgent, AgentLog, AgentResponse } from "./types"
import { Expense } from "@/types/expense"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface SubscriptionInfo {
    name: string
    amount: number
    frequency: string
    confidence: "High" | "Medium" | "Low"
    lastCharged: string
    isExplicit: boolean
}

export interface SubscriptionAnalysisResult {
    subscriptions: SubscriptionInfo[]
    totalMonthlyCost: number
    recommendations: string[]
}

export class SubscriptionAgent implements BaseAgent<SubscriptionAnalysisResult> {
    name = "Subscription Agent"
    description = "Detects recurring subscriptions, computes total monthly subscription drag, and proposes cancellations."

    async run(userId: string): Promise<AgentResponse<SubscriptionAnalysisResult>> {
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
            logStep("Database Query", "Loading transactions list to analyze subscription footprints...")
            const { data: expensesData, error } = await supabaseAdmin
                .from("expenses")
                .select("*")
                .eq("user_id", userId)
                .eq("type", "expense")
                .order("date", { ascending: false })

            if (error) throw error
            const expenses = (expensesData || []) as Expense[]
            logStep("Footprint Detection", `Processing ${expenses.length} historic expenses...`)

            const subscriptionsMap = new Map<string, SubscriptionInfo>()

            // 1. Identify explicitly flagged subscriptions
            expenses.filter(e => e.is_recurring).forEach(e => {
                const key = e.description.toLowerCase().trim()
                if (!subscriptionsMap.has(key)) {
                    subscriptionsMap.set(key, {
                        name: e.description,
                        amount: Number(e.amount),
                        frequency: "Monthly",
                        confidence: "High",
                        lastCharged: e.date,
                        isExplicit: true,
                    })
                }
            })

            // 2. Identify implicit subscriptions via repetition analysis
            logStep("Heuristics Check", "Grouping transactions by description and analyzing date intervals...")
            const groups: Record<string, Expense[]> = {}
            expenses.forEach((e) => {
                const descKey = e.description.toLowerCase().replace(/\s+/g, " ").trim()
                // Match descriptions that are similar (e.g. Netflix, Netflix.com) or identical
                const matchKey = descKey.split(" ")[0] || descKey
                groups[matchKey] = groups[matchKey] || []
                groups[matchKey].push(e)
            })

            Object.values(groups).forEach((list) => {
                if (list.length >= 2) {
                    // Sort by date ascending to check gaps
                    const sortedList = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    const dateGaps: number[] = []
                    let amountMatch = true
                    const firstAmount = Number(sortedList[0].amount)

                    for (let i = 1; i < sortedList.length; i++) {
                        const date1 = new Date(sortedList[i - 1].date)
                        const date2 = new Date(sortedList[i].date)
                        const diffTime = Math.abs(date2.getTime() - date1.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        dateGaps.push(diffDays)

                        if (Math.abs(Number(sortedList[i].amount) - firstAmount) > 5) {
                            amountMatch = false
                        }
                    }

                    // Check for monthly pattern (approx. 25 to 35 days)
                    const isMonthlyPattern = dateGaps.some(gap => gap >= 25 && gap <= 35)
                    
                    if (isMonthlyPattern) {
                        const representative = sortedList[sortedList.length - 1]
                        const mapKey = representative.description.toLowerCase().trim()
                        
                        if (!subscriptionsMap.has(mapKey)) {
                            subscriptionsMap.set(mapKey, {
                                name: representative.description,
                                amount: Number(representative.amount),
                                frequency: "Monthly",
                                confidence: amountMatch ? "High" : "Medium",
                                lastCharged: representative.date,
                                isExplicit: false,
                            })
                        }
                    }
                }
            })

            const detectedSubscriptions = Array.from(subscriptionsMap.values())
            const totalCost = detectedSubscriptions.reduce((sum, s) => sum + s.amount, 0)
            logStep("AI Filter", `Detected ${detectedSubscriptions.length} subscriptions totaling $${totalCost.toFixed(2)}/mo. Sending to Groq...`)

            const subscriptionPrompt = `
You are the Subscription Agent sub-agent of an elite financial copilot.
Help the user identify duplicate subscriptions and suggest cancellations to reduce financial waste.

List of Detected Subscriptions:
${detectedSubscriptions.map(s => `- ${s.name}: $${s.amount}/mo (Confidence: ${s.confidence}, Explicit: ${s.isExplicit}, Last charged: ${s.lastCharged})`).join("\n")}

Generate concrete recommendations. Look for duplicates or overlaps (e.g. multiple streaming services, multiple gym charges, premium SaaS), and compute annual savings if canceled.

Format your response in EXACTLY this JSON format:
{
  "recommendations": [
    "Identify overlapping services and suggest downgrading...",
    "Highlight specific monthly drag and potential annual savings..."
  ]
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI subscription auditor. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: subscriptionPrompt,
                    },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            logStep("Analysis Done", "Successfully compiled and audited subscription list.")

            return {
                agentName: this.name,
                success: true,
                result: {
                    subscriptions: detectedSubscriptions,
                    totalMonthlyCost: parseFloat(totalCost.toFixed(2)),
                    recommendations: parsed.recommendations || [],
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        } catch (error: any) {
            console.error("SubscriptionAgent run error:", error)
            logStep("Error Encountered", error.message || String(error))
            return {
                agentName: this.name,
                success: false,
                result: {
                    subscriptions: [],
                    totalMonthlyCost: 0,
                    recommendations: ["Error analyzing subscriptions. Please try again."],
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        }
    }
}
