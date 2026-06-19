import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { FinancialOrchestratorAgent } from "@/lib/agents/FinancialOrchestratorAgent"

async function authenticateRequest(request: Request): Promise<string | null> {
    const authHeader = request.headers.get("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
        if (!error && user) return user.id
    }

    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { user } } = await supabase.auth.getUser()
        if (user) return user.id
    } catch (e) {
        // ignore cookies error at pre-render
    }

    return null
}

export async function POST(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { message } = body

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required and must be a string." }, { status: 400 })
        }

        const result = await FinancialOrchestratorAgent.run(userId, message)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("API Chat route error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
