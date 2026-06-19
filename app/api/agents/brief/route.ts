import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DailyBriefAgent } from "@/lib/agents/DailyBriefAgent"

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
        // ignore
    }

    return null
}

// GET: Retrieve the latest brief or generate one if none exists
export async function GET(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from("daily_briefs")
            .select("brief")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)

        if (error) throw error

        if (data && data.length > 0) {
            return NextResponse.json(data[0].brief)
        }

        // If none found, generate one dynamically
        const newBrief = await DailyBriefAgent.generate(userId)
        return NextResponse.json(newBrief)
    } catch (error: any) {
        console.error("API GET brief error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

// POST: Regenerate briefing
export async function POST(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const briefData = await DailyBriefAgent.generate(userId)
        return NextResponse.json(briefData)
    } catch (error: any) {
        console.error("API POST brief error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
