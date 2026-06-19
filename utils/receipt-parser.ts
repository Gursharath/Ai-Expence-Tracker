export interface ParsedReceipt {
    amount: number

    category: string

    description: string

    date: string
}

export function parseReceiptText(
    text: string
): ParsedReceipt {
    const lowerText =
        text.toLowerCase()

    let category = "Shopping"

    if (
        lowerText.includes("restaurant") ||
        lowerText.includes("food") ||
        lowerText.includes("cafe") ||
        lowerText.includes("burger") ||
        lowerText.includes("pizza")
    ) {
        category = "Food"
    }

    if (
        lowerText.includes("uber") ||
        lowerText.includes("ola") ||
        lowerText.includes("taxi") ||
        lowerText.includes("travel")
    ) {
        category = "Travel"
    }

    if (
        lowerText.includes("electricity") ||
        lowerText.includes("water") ||
        lowerText.includes("internet")
    ) {
        category = "Bills"
    }

    const amountMatch =
        text.match(
            /\d+\.\d{2}|\d+/g
        )

    let amount = 0

    if (amountMatch) {
        const numbers = amountMatch.map(
            Number
        )

        amount = Math.max(...numbers)
    }

    const lines = text
        .split("\n")
        .filter(
            (line) =>
                line.trim().length > 3
        )

    const description =
        lines[0] || "Receipt Expense"

    return {
        amount,

        category,

        description,

        date: new Date().toISOString(),
    }
}