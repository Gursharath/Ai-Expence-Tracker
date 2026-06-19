import { NextResponse } from "next/server"

import {
    generateFinancialCoach,
} from "@/services/financial-coach"

export async function POST(
    request: Request
) {
    try {
        const { expenses } =
            await request.json()

        const coaching =
            await generateFinancialCoach(
                expenses
            )

        return NextResponse.json({
            coaching,
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                coaching:
                    "Unable to generate coaching.",
            },
            {
                status: 500,
            }
        )
    }
}