import { supabase } from "@/lib/supabase"

import { Budget } from "@/types/budget"

export async function getBudgets() {
    const {
        data,
        error,
    } = await supabase
        .from("budgets")
        .select("*")

    if (error) throw error

    return data as Budget[]
}

export async function addBudget(
    budget: Partial<Budget>
) {
    const {
        data,
        error,
    } = await supabase
        .from("budgets")
        .insert([budget])
        .select()

    if (error) throw error

    return data
}

export async function deleteBudget(
    id: string
) {
    const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)

    if (error) throw error
}