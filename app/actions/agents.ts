import { supabase } from "@/lib/supabase"

// Client-side fetch helper with Authorization token headers
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // 1. Fetch current session from browser local storage
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    // 2. Format headers with token
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }

    // 3. Make fetch request
    const res = await fetch(url, {
        ...options,
        headers,
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Request failed")
    }

    return res.json()
}

// 1. Coordinated Copilot Chat Action
export async function runOrchestrator(message: string) {
    return fetchWithAuth("/api/agents/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
    })
}

// 2. Fetch Agent Logs
export async function getAgentLogs() {
    return fetchWithAuth("/api/agents/logs")
}

// 3. Save Custom Memory fact
export async function saveMemoryAction(memory: string, memoryType: string, importance: number) {
    return fetchWithAuth("/api/agents/memories", {
        method: "POST",
        body: JSON.stringify({ memory, memoryType, importance }),
    })
}

// 4. Retrieve All Memories
export async function getMemories() {
    return fetchWithAuth("/api/agents/memories")
}

// 5. Delete specific memory cell
export async function deleteMemoryAction(id: string) {
    return fetchWithAuth(`/api/agents/memories?id=${id}`, {
        method: "DELETE",
    })
}

// 6. Generate Dynamic Daily Briefing
export async function generateDailyBriefAction() {
    return fetchWithAuth("/api/agents/brief", {
        method: "POST",
    })
}

// 7. Get Latest Daily Briefing
export async function getLatestDailyBrief() {
    return fetchWithAuth("/api/agents/brief")
}
