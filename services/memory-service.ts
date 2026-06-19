import { supabaseAdmin } from "@/lib/supabase-admin"
import OpenAI from "openai"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export interface AIMemory {
    id: string
    user_id: string
    memory: string
    memory_type: string
    importance_score: number
    created_at: string
}

export class MemoryService {
    // 1. Save new memory fact
    static async saveMemory(
        userId: string,
        memory: string,
        memoryType: string = "general",
        importanceScore: number = 1
    ): Promise<AIMemory | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from("ai_memory")
                .insert([
                    {
                        user_id: userId,
                        memory: memory.trim(),
                        memory_type: memoryType,
                        importance_score: importanceScore,
                    },
                ])
                .select()
                .single()

            if (error) throw error
            console.log(`[MemoryService] Saved new memory: "${memory}" of type "${memoryType}"`)
            return data as AIMemory
        } catch (error) {
            console.error("[MemoryService] Failed to save memory:", error)
            return null
        }
    }

    // 2. Retrieve all memories
    static async retrieveMemories(userId: string): Promise<AIMemory[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from("ai_memory")
                .select("*")
                .eq("user_id", userId)
                .order("importance_score", { ascending: false })

            if (error) throw error
            return (data || []) as AIMemory[]
        } catch (error) {
            console.error("[MemoryService] Failed to retrieve memories:", error)
            return []
        }
    }

    // 3. Rank memories based on relevance to a query
    static async rankMemories(userId: string, query: string, limit: number = 5): Promise<AIMemory[]> {
        try {
            const memories = await this.retrieveMemories(userId)
            if (memories.length === 0) return []

            // If there are few memories, just return them
            if (memories.length <= limit) return memories

            const memoryListStr = memories
                .map((m, idx) => `[ID: ${idx}] Type: ${m.memory_type}, Fact: "${m.memory}", Importance: ${m.importance_score}`)
                .join("\n")

            const prompt = `
You are a memory selection agent for a financial copilot.
We have a set of user memories and a new user query: "${query}".

Analyze the user query and the list of memories. Select the top ${limit} memories that are most relevant to understanding or answering this query (e.g. if the user asks about buying a car, select car memories; if the user asks general questions, select key preferences like salary or budgeting styles).

Memories list:
${memoryListStr}

Output ONLY a JSON object containing the indices of the selected memories in order of relevance:
{
  "selectedIndices": [2, 0, 4]
}
Do NOT output any other text besides the JSON code block.
`
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an agent that ranks and selects relevant memories. You output ONLY structured JSON.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            })

            const contentText = completion.choices[0]?.message?.content || "{}"
            const parsed = JSON.parse(contentText)
            const selectedIndices: number[] = parsed.selectedIndices || []

            const ranked: AIMemory[] = []
            selectedIndices.forEach((idx) => {
                if (memories[idx]) {
                    ranked.push(memories[idx])
                }
            })

            // Fallback to top memories by importance score if LLM selection fails or is empty
            if (ranked.length === 0) {
                return memories.slice(0, limit)
            }

            return ranked.slice(0, limit)
        } catch (error) {
            console.error("[MemoryService] Failed to rank memories, falling back to top important:", error)
            const memories = await this.retrieveMemories(userId)
            return memories.slice(0, limit)
        }
    }

    // 4. Delete specific memory
    static async deleteMemory(userId: string, id: string): Promise<boolean> {
        try {
            const { error } = await supabaseAdmin
                .from("ai_memory")
                .delete()
                .eq("id", id)
                .eq("user_id", userId)

            if (error) throw error
            console.log(`[MemoryService] Deleted memory: ${id}`)
            return true
        } catch (error) {
            console.error("[MemoryService] Failed to delete memory:", error)
            return false
        }
    }
}
