import { Expense } from "@/types/expense"

export interface Subscription {
    description: string
    amount: number
    count: number
}

export function detectSubscriptions(
    expenses: Expense[]
): Subscription[] {
    const grouped: Record<
        string,
        {
            amount: number
            count: number
        }
    > = {}

    expenses
        .filter(
            (e) => e.type === "expense"
        )
        .forEach((expense) => {
            const key =
                expense.description.toLowerCase()

            if (!grouped[key]) {
                grouped[key] = {
                    amount: Number(
                        expense.amount
                    ),
                    count: 1,
                }
            } else {
                grouped[key].count += 1
            }
        })

    return Object.entries(grouped)
        .filter(
            ([_, value]) =>
                value.count >= 2
        )
        .map(([key, value]) => ({
            description: key,

            amount: value.amount,

            count: value.count,
        }))
}