import { Expense } from "@/types/expense"

export function getCategoryData(
    expenses: Expense[]
) {
    const grouped: Record<
        string,
        number
    > = {}

    expenses
        .filter(
            (expense) =>
                expense.type === "expense"
        )
        .forEach((expense) => {
            const category =
                expense.category

            grouped[category] =
                (grouped[category] || 0) +
                Number(expense.amount)
        })

    return Object.entries(grouped).map(
        ([name, value]) => ({
            name,
            value,
        })
    )
}

export function getMonthlyData(
    expenses: Expense[]
) {
    const grouped: Record<
        string,
        {
            income: number
            expense: number
        }
    > = {}

    expenses.forEach((expense) => {
        const month = new Date(
            expense.date
        ).toLocaleString("default", {
            month: "short",
        })

        if (!grouped[month]) {
            grouped[month] = {
                income: 0,
                expense: 0,
            }
        }

        if (expense.type === "income") {
            grouped[month].income += Number(
                expense.amount
            )
        } else {
            grouped[month].expense += Number(
                expense.amount
            )
        }
    })

    return Object.entries(grouped).map(
        ([month, values]) => ({
            month,
            ...values,
        })
    )
}