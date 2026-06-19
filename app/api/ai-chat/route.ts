import { NextResponse } from "next/server"

import OpenAI from "openai"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,

    baseURL:
        "https://api.groq.com/openai/v1",
})

export async function POST(
    request: Request
) {
    try {
        const body =
            await request.json()

        const {
            messages,
            expenses,
        } = body

        const completion =
            await groq.chat.completions.create(
                {
                    model:
                        "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",

                            content: `
You are a professional AI finance assistant.

Help users:
- analyze expenses
- improve savings
- manage budgets
- understand spending patterns
- improve financial habits

Use the user's real expense data.

Financial Data:
${JSON.stringify(expenses)}
`,
                        },

                        ...messages,
                    ],

                    temperature: 0.7,
                }
            )

        return NextResponse.json({
            message:
                completion.choices[0]
                    .message.content,
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json({
            message:
                "AI assistant is temporarily unavailable.",
        })
    }
}