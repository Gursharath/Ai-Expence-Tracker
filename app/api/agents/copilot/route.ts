import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { FinancialOrchestratorAgent } from "@/lib/agents/FinancialOrchestratorAgent"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
    try {
        let userId: string | null = null

        // 1. Try to authenticate via Authorization Bearer Token
        const authHeader = request.headers.get("Authorization")
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7)
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
            if (!error && user) {
                userId = user.id
            }
        }

        // 2. Fallback to cookie-based Route Handler Client
        if (!userId) {
            const supabase = createRouteHandlerClient({ cookies })
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                userId = user.id
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { message } = body

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required and must be a string." }, { status: 400 })
        }

        const copilotResult = await FinancialOrchestratorAgent.run(userId, message)
        
        // Map back to format expected by existing frontend widgets
        return NextResponse.json({
            answer: copilotResult.answer,
            analysis: {
                spending: copilotResult.subAgentData.spending,
                budget: copilotResult.subAgentData.budget,
                goals: copilotResult.subAgentData.savings
            }
        })
    } catch (error: unknown) {
        const err = error as Error
        console.error("Copilot API Route Error:", err)
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

