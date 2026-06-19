import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"
import { Goal } from "@/types/goal"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export class GoalAgent {
    // Calculate required monthly savings
    static calculateMonthlySavings(targetAmount: number, currentAmount: number, targetDateStr: string): number {
        const targetDate = new Date(targetDateStr)
        const today = new Date()
        
        let months = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth())
        if (months <= 0) months = 1 // Min 1 month

        const remaining = targetAmount - currentAmount
        if (remaining <= 0) return 0

        return parseFloat((remaining / months).toFixed(1))
    }

    // Estimate completion date based on current monthly contributions
    static estimateCompletion(targetAmount: number, currentAmount: number, monthlyContribution: number): Date {
        if (monthlyContribution <= 0) {
            return new Date(new Date().getFullYear() + 10, 0, 1) // 10 years out
        }

        const remaining = targetAmount - currentAmount
        if (remaining <= 0) return new Date()

        const monthsNeeded = Math.ceil(remaining / monthlyContribution)
        const completionDate = new Date()
        completionDate.setMonth(completionDate.getMonth() + monthsNeeded)

        return completionDate
    }

    // Track Goal Progress
    static async trackGoalProgress(userId: string) {
        const { data: goalsData, error } = await supabaseAdmin
            .from("goals")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")

        if (error) throw error
        const goals = goalsData as Goal[]

        return goals.map((goal) => {
            const currentAmount = Number(goal.current_amount)
            const targetAmount = Number(goal.target_amount)
            const remaining = targetAmount - currentAmount
            const progressPercentage = targetAmount > 0 ? parseFloat(((currentAmount / targetAmount) * 100).toFixed(1)) : 0
            const requiredMonthlySavings = this.calculateMonthlySavings(targetAmount, currentAmount, goal.target_date)

            return {
                id: goal.id,
                title: goal.title,
                targetAmount,
                currentAmount,
                remaining,
                progressPercentage,
                targetDate: goal.target_date,
                requiredMonthlySavings,
            }
        })
    }

    // Generate savings plans (AI structured recommendations using Groq Llama 3.3)
    static async generateGoalSavingsPlans(userId: string, currentMonthlySavings: number) {
        try {
            const goalsProgress = await this.trackGoalProgress(userId)
            const totalRequiredMonthly = goalsProgress.reduce((sum, g) => sum + g.requiredMonthlySavings, 0)

            const prompt = `
You are an AI Goal Planning Agent.
The user has the following active savings goals:
${JSON.stringify(goalsProgress, null, 2)}

User's current monthly savings rate: $${currentMonthlySavings}
Total required monthly savings to meet all goals on time: $${totalRequiredMonthly}

Provide your saving plans in EXACTLY this JSON format:
{
  "recommendations": [
    "Plan suggestion 1...",
    "Plan suggestion 2..."
  ],
  "feasibilityScore": 75,
  "savingsDeficit": 300
}

Rules:
- Calculate the feasibilityScore (0-100) comparing target required savings vs current actual savings rate.
- Calculate savingsDeficit (how much more they need to save monthly to meet goals).
- Provide practical strategies to cut expenses or increase income to cover the savingsDeficit.
- Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI savings goal planner. You output ONLY structured JSON matching the requested schema.",
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
                recommendations: parsed.recommendations || [],
                feasibilityScore: parsed.feasibilityScore || 0,
                savingsDeficit: parsed.savingsDeficit || 0,
            }
        } catch (error) {
            console.error("GoalAgent generateGoalSavingsPlans failed, falling back:", error)
            return {
                recommendations: [
                    "Increase your monthly contributions to match your target goal deadlines.",
                    "Review discretionary categories like Dining to fund your active savings targets."
                ],
                feasibilityScore: 50,
                savingsDeficit: 0,
            }
        }
    }

    // Unified helper for Supervisor Copilot
    static async runAgent(userId: string, currentMonthlySavings: number) {
        const goalsProgress = await this.trackGoalProgress(userId)
        const plans = await this.generateGoalSavingsPlans(userId, currentMonthlySavings)

        return {
            goals: goalsProgress,
            recommendations: plans.recommendations,
            feasibilityScore: plans.feasibilityScore,
            savingsDeficit: plans.savingsDeficit,
        }
    }
}
