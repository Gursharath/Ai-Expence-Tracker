import { NextResponse } from "next/server"

import {
    generateAIInsights,
} from "@/services/openai-service"

import {
    sendMonthlyReport,
} from "@/services/email-service"

export async function POST(
    request: Request
) {
    try {
        const {
            expenses,
            email,
        } = await request.json()

        const insights =
            await generateAIInsights(
                expenses
            )

        await sendMonthlyReport(
            email,
            insights
        )

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                success: false,
            },
            {
                status: 500,
            }
        )
    }
}