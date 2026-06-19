import { Expense } from "@/types/expense"

import { Budget } from "@/types/budget"

export function analyzeNotifications(
    expenses: Expense[],
    budgets: Budget[]
) {
    const notifications: string[] =
        []

    budgets.forEach((budget) => {
        const spent = expenses
            .filter(
                (expense) =>
                    expense.category ===
                    budget.category &&
                    expense.type ===
                    "expense"
            )
            .reduce(
                (acc, curr) =>
                    acc +
                    Number(curr.amount),
                0
            )

        const percentage =
            (spent /
                budget.monthly_limit) *
            100

        if (percentage >= 100) {
            notifications.push(
                `You exceeded your ${budget.category} budget`
            )
        } else if (
            percentage >= 80
        ) {
            notifications.push(
                `${budget.category} budget is almost full`
            )
        }
    })

    const travelExpenses =
        expenses.filter(
            (e) =>
                e.category ===
                "Travel" &&
                e.type === "expense"
        )

    const travelTotal =
        travelExpenses.reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    if (travelTotal > 1000) {
        notifications.push(
            "Travel spending increased significantly"
        )
    }

    const subscriptions =
        expenses.filter(
            (e) =>
                e.description
                    .toLowerCase()
                    .includes("netflix") ||
                e.description
                    .toLowerCase()
                    .includes("spotify")
        )

    if (
        subscriptions.length > 0
    ) {
        notifications.push(
            "Subscription renewal detected"
        )
    }

    return notifications
}