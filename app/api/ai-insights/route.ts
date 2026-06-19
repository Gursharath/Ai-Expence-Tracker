import { NextResponse } from "next/server"

import { generateAIInsights } from "@/services/openai-service"

export async function POST(
    request: Request
) {
    try {
        const body =
            await request.json()

        const insights =
            await generateAIInsights(
                body.expenses
            )

        return NextResponse.json({
            insights,
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                error:
                    "Failed to generate insights",
            },
            {
                status: 500,
            }
        )
    }
}