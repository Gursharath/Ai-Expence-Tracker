import { supabase } from "@/lib/supabase"
import { Goal } from "@/types/goal"

export async function getGoals() {
    const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data as Goal[]
}

export async function addGoal(goal: Partial<Goal>) {
    const { data, error } = await supabase
        .from("goals")
        .insert([goal])
        .select()

    if (error) throw error
    return data
}

export async function updateGoal(id: string, updates: Partial<Goal>) {
    const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .select()

    if (error) throw error
    return data
}

export async function deleteGoal(id: string) {
    const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)

    if (error) throw error
}
