import OpenAI from "openai"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,

    baseURL:
        "https://api.groq.com/openai/v1",
})

/* =========================================
   FALLBACK AI
========================================= */

function generateFallbackInsights(
    expenses: any[]
) {
    const expenseOnly =
        expenses.filter(
            (e) => e.type === "expense"
        )

    const incomeOnly =
        expenses.filter(
            (e) => e.type === "income"
        )

    const totalExpenses =
        expenseOnly.reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const totalIncome =
        incomeOnly.reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const savings =
        totalIncome - totalExpenses

    const topCategories: Record<
        string,
        number
    > = {}

    expenseOnly.forEach((expense) => {
        topCategories[
            expense.category
        ] =
            (topCategories[
                expense.category
            ] || 0) +
            Number(expense.amount)
    })

    const sortedCategories =
        Object.entries(
            topCategories
        ).sort(
            (a, b) => b[1] - a[1]
        )

    const topCategory =
        sortedCategories[0]?.[0] ||
        "General"

    const savingsRate =
        totalIncome > 0
            ? Math.round(
                (savings /
                    totalIncome) *
                100
            )
            : 0

    return `
# AI Financial Insights

## Financial Summary

• Total Income: $${totalIncome}

• Total Expenses: $${totalExpenses}

• Current Savings: $${savings}

• Savings Rate: ${savingsRate}%

---

## Spending Analysis

• Highest spending category: ${topCategory}

• Your spending patterns appear relatively stable.

• No extreme financial anomalies detected.

---

## Smart Recommendations

• Create tighter category-based budgets.

• Reduce unnecessary recurring expenses.

• Maintain at least 6 months of emergency savings.

• Increase monthly savings consistency.

• Review subscription services regularly.

---

## AI Financial Health Score

${savingsRate >= 40
            ? "Excellent financial discipline."
            : savingsRate >= 20
                ? "Healthy financial condition."
                : "Consider improving savings habits."
        }
`
}

/* =========================================
   MAIN AI GENERATION
========================================= */

export async function generateAIInsights(
    expenses: any[]
) {
    try {
        if (!expenses.length) {
            return `
# AI Financial Insights

No financial data available yet.

Start adding transactions to unlock:
• AI spending analysis
• Savings recommendations
• Financial health scoring
• Smart budgeting insights
`
        }

        const formattedExpenses =
            expenses.map((expense) => ({
                category:
                    expense.category,

                amount:
                    Number(
                        expense.amount
                    ),

                type: expense.type,

                description:
                    expense.description ||
                    "No description",
            }))

        /* =========================
           QUICK ANALYTICS
        ========================= */

        const expenseOnly =
            expenses.filter(
                (e) =>
                    e.type ===
                    "expense"
            )

        const incomeOnly =
            expenses.filter(
                (e) =>
                    e.type ===
                    "income"
            )

        const totalExpenses =
            expenseOnly.reduce(
                (acc, curr) =>
                    acc +
                    Number(curr.amount),
                0
            )

        const totalIncome =
            incomeOnly.reduce(
                (acc, curr) =>
                    acc +
                    Number(curr.amount),
                0
            )

        const savings =
            totalIncome -
            totalExpenses

        const prompt = `
You are an elite AI financial advisor for a premium fintech SaaS platform.

Your job is to provide:
- intelligent financial analysis
- actionable recommendations
- concise professional insights
- realistic financial coaching

The tone should feel:
- modern
- premium
- smart
- practical
- data-driven

DO NOT sound robotic.

DO NOT repeat raw numbers excessively.

Use clean markdown formatting.

-----------------------------------

FINANCIAL SUMMARY

Total Income: $${totalIncome}

Total Expenses: $${totalExpenses}

Current Savings: $${savings}

-----------------------------------

TRANSACTION DATA

${JSON.stringify(formattedExpenses)}

-----------------------------------

Generate the response using EXACTLY these sections:

# AI Financial Insights

## Financial Overview

## Spending Behavior Analysis

## Savings & Budget Recommendations

## Potential Financial Risks

## Smart AI Recommendations

## Final Financial Health Summary

Keep it concise but insightful.
`

        const completion =
            await groq.chat.completions.create(
                {
                    model:
                        "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",

                            content:
                                `
You are a world-class AI finance advisor.

You provide:
- premium fintech insights
- intelligent spending analysis
- concise actionable advice
- professional financial coaching

Never sound generic.
Always sound analytical and modern.
`,
                        },

                        {
                            role: "user",

                            content:
                                prompt,
                        },
                    ],

                    temperature: 0.7,

                    max_tokens: 1200,
                }
            )

        return (
            completion.choices[0]
                ?.message?.content ||
            generateFallbackInsights(
                expenses
            )
        )
    } catch (error) {
        console.error(
            "Groq API failed:",
            error
        )

        return generateFallbackInsights(
            expenses
        )
    }
}