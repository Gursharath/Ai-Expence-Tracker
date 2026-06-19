import { Expense } from "@/types/expense"

export function getWeeklyTrendData(
    expenses: Expense[]
) {
    const weeks = [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
    ]

    return weeks.map(
        (week, index) => {
            const weekExpenses =
                expenses.filter(
                    (expense) => {
                        const date =
                            new Date(
                                expense.date
                            )

                        const weekNumber =
                            Math.ceil(
                                date.getDate() / 7
                            )

                        return (
                            weekNumber ===
                            index + 1 &&
                            expense.type ===
                            "expense"
                        )
                    }
                )

            const total =
                weekExpenses.reduce(
                    (acc, curr) =>
                        acc +
                        Number(curr.amount),
                    0
                )

            return {
                week,
                spending: total,
            }
        }
    )
}

export function getSavingsGrowthData(
    expenses: Expense[]
) {
    let runningSavings = 0

    return expenses
        .sort(
            (a, b) =>
                new Date(
                    a.date
                ).getTime() -
                new Date(
                    b.date
                ).getTime()
        )
        .map((expense) => {
            if (
                expense.type ===
                "income"
            ) {
                runningSavings +=
                    Number(expense.amount)
            } else {
                runningSavings -=
                    Number(expense.amount)
            }

            return {
                date: expense.date,

                savings:
                    runningSavings,
            }
        })
}