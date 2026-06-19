import { Expense } from "@/types/expense"

export interface HealthResult {
    score: number
    status: string
    tips: string[]
}

export function calculateFinancialHealth(
    expenses: Expense[]
): HealthResult {
    const income = expenses
        .filter(
            (e) => e.type === "income"
        )
        .reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const expense = expenses
        .filter(
            (e) => e.type === "expense"
        )
        .reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const savings =
        income - expense

    let score = 50

    const tips: string[] = []

    if (income > 0) {
        const savingsRate =
            (savings / income) * 100

        if (savingsRate > 40) {
            score += 30

            tips.push(
                "Excellent savings rate."
            )
        } else if (
            savingsRate > 20
        ) {
            score += 20

            tips.push(
                "Healthy savings habit."
            )
        } else {
            score -= 10

            tips.push(
                "Try improving savings."
            )
        }
    }

    if (expense > income) {
        score -= 20

        tips.push(
            "Expenses exceed income."
        )
    }

    if (score > 100)
        score = 100

    if (score < 0)
        score = 0

    let status = "Average"

    if (score >= 80)
        status = "Excellent"

    else if (score >= 60)
        status = "Good"

    else if (score >= 40)
        status = "Average"

    else status = "Poor"

    return {
        score,
        status,
        tips,
    }
}