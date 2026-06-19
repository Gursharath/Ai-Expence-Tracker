import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { SpendingAnalystAgent } from "./SpendingAnalystAgent"
import { BudgetAgent } from "./BudgetAgent"
import { SavingsAgent } from "./SavingsAgent"
import { ForecastAgent } from "./ForecastAgent"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface DailyBriefPayload {
    summary: string
    spendingSummary: string
    budgetStatus: string
    savingsProgress: string
    forecastDetails: string
    recommendations: string[]
}

export class DailyBriefAgent {
    static async generate(userId: string): Promise<DailyBriefPayload> {
        const spendingAgent = new SpendingAnalystAgent()
        const budgetAgent = new BudgetAgent()
        const savingsAgent = new SavingsAgent()
        const forecastAgent = new ForecastAgent()

        // 1. Run all critical agents in parallel
        const [spendingRes, budgetRes, savingsRes, forecastRes] = await Promise.all([
            spendingAgent.run(userId),
            budgetAgent.run(userId),
            savingsAgent.run(userId),
            forecastAgent.run(userId),
        ])

        const payload = {
            spending: spendingRes.success ? spendingRes.result : null,
            budget: budgetRes.success ? budgetRes.result : null,
            savings: savingsRes.success ? savingsRes.result : null,
            forecast: forecastRes.success ? forecastRes.result : null,
        }

        // 2. Leverage Groq to generate a highly polished executive briefing
        const prompt = `
You are the Chief Financial Briefing Agent. Assemble a daily financial briefing based on the sub-agent data payloads.

Data Payload:
${JSON.stringify(payload, null, 2)}

Requirements for each section:
- "summary": A premium, encouraging, data-backed 2-3 sentence overview of the user's financial health.
- "spendingSummary": Concise analysis of spending compared to last month and top categories.
- "budgetStatus": Summarize budget limits, utilization, and if any overspending risk exists.
- "savingsProgress": Report active goals, feasibility score, and monthly target deficit.
- "forecastDetails": Explain predictions for next month spending and expected cash flow.
- "recommendations": Top 3-4 bullet-point actions they should take today.

Format your response in EXACTLY this JSON format:
{
  "summary": "Brief executive summary...",
  "spendingSummary": "Spending notes...",
  "budgetStatus": "Budget status notes...",
  "savingsProgress": "Savings goals notes...",
  "forecastDetails": "Forecast notes...",
  "recommendations": [
    "Rec 1...",
    "Rec 2...",
    "Rec 3..."
  ]
}
Do NOT output any other text besides the JSON code block.
`
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an executive financial briefing writer. You output ONLY structured JSON matching the requested schema.",
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
        const briefData = JSON.parse(responseText) as DailyBriefPayload

        // 3. Save to database table `daily_briefs`
        try {
            await supabaseAdmin.from("daily_briefs").insert([
                {
                    user_id: userId,
                    brief: briefData,
                }
            ])
            console.log(`[DailyBriefAgent] Stored daily brief for user: ${userId}`)
        } catch (dbErr) {
            console.error("Failed to store daily brief in db:", dbErr)
        }

        return briefData
    }
}
