import { supabase } from "@/lib/supabase"

import { Expense } from "@/types/expense"

export async function getExpenses() {
    const {
        data,
        error,
    } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })

    if (error) throw error

    return data as Expense[]
}

export async function addExpense(
    expense: Partial<Expense>
) {
    const {
        data,
        error,
    } = await supabase
        .from("expenses")
        .insert([expense])
        .select()

    if (error) throw error

    return data
}

export async function deleteExpense(
    id: string
) {
    const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)

    if (error) throw error
}