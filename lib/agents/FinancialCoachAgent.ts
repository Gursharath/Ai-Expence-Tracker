import OpenAI from "openai"
import { BaseAgent, AgentLog, AgentResponse } from "./types"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface CoachAnalysisResult {
    tip: string
    review: string
    savingsAdvice: string[]
    challenge: string
    actionPlan: string[]
    adviceMarkdown: string
}

export class FinancialCoachAgent implements BaseAgent<CoachAnalysisResult> {
    name = "Financial Coach"
    description = "Provides holistic coaching, actionable step-by-step improvements, and gamified financial challenges."

    async run(userId: string, context?: any): Promise<AgentResponse<CoachAnalysisResult>> {
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
            logStep("Consolidating Context", "Reading data aggregates compiled by sub-agents...")
            const spending = context?.spending || null
            const budget = context?.budget || null
            const savings = context?.savings || null
            const subscriptions = context?.subscriptions || null
            const forecast = context?.forecast || null

            logStep("AI Advising", "Querying Groq to formulate a personalized money-saving coaching sheet...")
            const coachPrompt = `
You are the Financial Coach sub-agent of an elite financial copilot.
Your job is to synthesize all other sub-agent metrics and craft a motivational, actionable, premium coaching sheet.

Sub-Agent Findings:
- Spending Analyst: ${spending ? `Spend: $${spending.monthlySpend}, MoM change: ${spending.changePercentage}%, Alerts: ${JSON.stringify(spending.alerts)}` : "No spending details available"}
- Budget Agent: ${budget ? `Utilized: ${budget.utilizationPercentage}%, Risks: ${JSON.stringify(budget.overrunRisks.map((r: any) => r.category))}` : "No budget details available"}
- Savings Agent: ${savings ? `Score: ${savings.feasibilityScore}/100, Deficit: $${savings.savingsDeficit}, Goals: ${JSON.stringify(savings.goals.map((g: any) => g.title))}` : "No goals details available"}
- Subscription Agent: ${subscriptions ? `Total Subscription cost: $${subscriptions.totalMonthlyCost}/mo, Subscriptions: ${JSON.stringify(subscriptions.subscriptions.map((s: any) => s.name))}` : "No subscription details available"}
- Forecast Agent: ${forecast ? `Predicted next month spend: $${forecast.predictedSpending}, Cash flow: $${forecast.predictedCashFlow}` : "No forecast available"}

Rules for content:
- "tip": A catchy, single-sentence tip.
- "review": A brief summary of this week's/month's money behavior.
- "challenge": A gamified financial challenge (e.g. "Weekend zero-spend challenge", "Save $50 on dining this week").
- "actionPlan": Step-by-step instructions.

Format your response in EXACTLY this JSON format:
{
  "tip": "Tip details...",
  "review": "Review summary...",
  "savingsAdvice": ["Advice item 1", "Advice item 2"],
  "challenge": "Challenge details...",
  "actionPlan": ["Task 1", "Task 2"],
  "adviceMarkdown": "Full compiled markdown of the coaching sections."
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a motivational and strategic financial coach. You output ONLY structured JSON matching the requested schema.",
                    },
                    {
                        role: "user",
                        content: coachPrompt,
                    },
                ],
                temperature: 0.4,
                response_format: { type: "json_object" },
            })

            const responseText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(responseText)

            logStep("Coaching Completed", "Coaching advice and game challenges successfully created.")

            const finalResult: CoachAnalysisResult = {
                tip: parsed.tip || "Save consistently to build long-term security.",
                review: parsed.review || "Your spending patterns are stable.",
                savingsAdvice: parsed.savingsAdvice || ["Reduce discretionary spending where possible."],
                challenge: parsed.challenge || "Try a no-spend Sunday.",
                actionPlan: parsed.actionPlan || ["Review category budgets next month."],
                adviceMarkdown: parsed.adviceMarkdown || "No custom advice compiled.",
            }

            return {
                agentName: this.name,
                success: true,
                result: finalResult,
                logs,
                executionTime: Date.now() - startTime,
            }
        } catch (error: any) {
            console.error("FinancialCoachAgent run error:", error)
            logStep("Error Encountered", error.message || String(error))
            return {
                agentName: this.name,
                success: false,
                result: {
                    tip: "Review budget logs.",
                    review: "No history found.",
                    savingsAdvice: [],
                    challenge: "Create a savings goal.",
                    actionPlan: [],
                    adviceMarkdown: "Error building coach advice.",
                },
                logs,
                executionTime: Date.now() - startTime,
            }
        }
    }
}
