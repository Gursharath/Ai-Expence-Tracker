import OpenAI from "openai"

import { Expense } from "@/types/expense"

const groq = new OpenAI({
    apiKey:
        process.env.GROQ_API_KEY,

    baseURL:
        "https://api.groq.com/openai/v1",
})

/* =========================================
   FALLBACK COACH
========================================= */

function fallbackCoach(
    expenses: Expense[]
) {
    const income = expenses
        .filter(
            (e) => e.type === "income"
        )
        .reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const expense = expenses
        .filter(
            (e) => e.type === "expense"
        )
        .reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const savings =
        income - expense

    return `
# AI Financial Coach

## Daily Financial Tip

Focus on tracking recurring expenses consistently.

---

## Weekly Spending Review

Your spending appears relatively stable this week.

Current savings: $${savings}

---

## Smart Savings Advice

• Reduce unnecessary subscriptions.

• Build emergency savings.

• Set category spending limits.

---

## Financial Challenge

Try a “No unnecessary spending” challenge this weekend.

---

## AI Financial Coaching

You are building healthy financial habits. Continue improving your savings consistency and review large spending categories regularly.
`
}

/* =========================================
   MAIN COACH GENERATION
========================================= */

export async function generateFinancialCoach(
    expenses: Expense[]
) {
    try {
        if (!expenses.length) {
            return `
# AI Financial Coach

No financial data available yet.

Start adding expenses to unlock:
• AI coaching
• smart challenges
• savings advice
• financial mentoring
`
        }

        const totalIncome = expenses
            .filter(
                (e) => e.type === "income"
            )
            .reduce(
                (acc, curr) =>
                    acc + Number(curr.amount),
                0
            )

        const totalExpenses =
            expenses
                .filter(
                    (e) =>
                        e.type ===
                        "expense"
                )
                .reduce(
                    (acc, curr) =>
                        acc +
                        Number(curr.amount),
                    0
                )

        const savings =
            totalIncome -
            totalExpenses

        const prompt = `
You are an elite AI financial mentor inside a premium fintech SaaS application.

Your job is to act like:
- a financial coach
- a money mentor
- a smart budgeting assistant

Provide:
- practical coaching
- realistic recommendations
- actionable financial guidance
- spending discipline advice
- savings coaching

The tone should feel:
- premium
- modern
- motivational
- intelligent
- concise

DO NOT sound robotic.

-----------------------------------

FINANCIAL SUMMARY

Total Income: $${totalIncome}

Total Expenses: $${totalExpenses}

Current Savings: $${savings}

-----------------------------------

TRANSACTION DATA

${JSON.stringify(expenses)}

-----------------------------------

Generate the response using EXACTLY these sections:

# AI Financial Coach

## Daily Financial Tip

## Weekly Spending Review

## Smart Savings Advice

## Financial Challenge

## AI Financial Coaching

Keep the response insightful and concise.
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
You are a world-class AI financial mentor.

You provide:
- financial discipline coaching
- intelligent savings guidance
- spending optimization advice
- premium fintech coaching

Always sound modern and analytical.
`,
                        },

                        {
                            role: "user",

                            content: prompt,
                        },
                    ],

                    temperature: 0.7,

                    max_tokens: 1200,
                }
            )

        return (
            completion.choices[0]
                ?.message?.content ||
            fallbackCoach(
                expenses
            )
        )
    } catch (error) {
        console.error(
            "Financial Coach AI failed:",
            error
        )

        return fallbackCoach(
            expenses
        )
    }
}