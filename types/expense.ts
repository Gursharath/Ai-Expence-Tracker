export interface Expense {
    id: string

    user_id: string

    amount: number

    category: string

    description: string

    date: string

    type: "income" | "expense"

    is_recurring: boolean

    created_at: string
}