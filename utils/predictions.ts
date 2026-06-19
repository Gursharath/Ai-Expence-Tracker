import { Expense } from "@/types/expense"

export interface PredictionResult {
    predictedExpense: number
    predictedIncome: number
    predictedSavings: number
    topCategory: string
    warning: string
}

export function generatePredictions(
    expenses: Expense[]
): PredictionResult {
    const incomeExpenses =
        expenses.filter(
            (e) => e.type === "income"
        )

    const expenseOnly =
        expenses.filter(
            (e) => e.type === "expense"
        )

    const totalIncome =
        incomeExpenses.reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const totalExpense =
        expenseOnly.reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const avgIncome =
        totalIncome /
        Math.max(
            incomeExpenses.length,
            1
        ) || 0

    const avgExpense =
        totalExpense /
        Math.max(
            expenseOnly.length,
            1
        ) || 0

    const categoryTotals: Record<
        string,
        number
    > = {}

    expenseOnly.forEach((expense) => {
        categoryTotals[
            expense.category
        ] =
            (categoryTotals[
                expense.category
            ] || 0) +
            Number(expense.amount)
    })

    let topCategory = "None"

    let maxAmount = 0

    Object.entries(categoryTotals).forEach(
        ([category, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount
                topCategory = category
            }
        }
    )

    const predictedExpense =
        Math.round(avgExpense * 1.1)

    const predictedIncome =
        Math.round(avgIncome)

    const predictedSavings =
        predictedIncome -
        predictedExpense

    let warning =
        "Financial outlook appears stable."

    if (
        predictedSavings < 0
    ) {
        warning =
            "Warning: Expenses may exceed income next month."
    }

    if (
        topCategory === "Food"
    ) {
        warning =
            "Food spending trend is increasing."
    }

    if (
        topCategory === "Travel"
    ) {
        warning =
            "Travel expenses are becoming significant."
    }

    return {
        predictedExpense,
        predictedIncome,
        predictedSavings,
        topCategory,
        warning,
    }
}