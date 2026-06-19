import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { MemoryService } from "@/services/memory-service"

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

// GET: Retrieve memories
export async function GET(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const memories = await MemoryService.retrieveMemories(userId)
        return NextResponse.json(memories)
    } catch (error: any) {
        console.error("API GET memories error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

// POST: Save manual memory
export async function POST(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { memory, memoryType, importance } = body

        if (!memory || typeof memory !== "string") {
            return NextResponse.json({ error: "Memory string is required." }, { status: 400 })
        }

        const result = await MemoryService.saveMemory(userId, memory, memoryType || "general", importance || 1)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("API POST memory error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

// DELETE: Remove memory
export async function DELETE(request: Request) {
    try {
        const userId = await authenticateRequest(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Memory ID is required." }, { status: 400 })
        }

        const success = await MemoryService.deleteMemory(userId, id)
        return NextResponse.json({ success })
    } catch (error: any) {
        console.error("API DELETE memory error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
