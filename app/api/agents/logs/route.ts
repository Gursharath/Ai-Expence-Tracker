import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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

export async function GET(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from("agent_logs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50)

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error("API Logs route error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
