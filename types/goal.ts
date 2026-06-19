export interface Goal {
    id?: string
    user_id?: string
    title: string
    target_amount: number
    current_amount: number
    target_date: string
    deadline?: string
    status?: 'active' | 'completed' | 'failed'
    created_at?: string
}