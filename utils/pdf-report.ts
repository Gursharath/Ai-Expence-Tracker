import jsPDF from "jspdf"

import autoTable from "jspdf-autotable"

export function generateFinancialReport(
    expenses: any[],
    aiInsights: string,
    healthScore: number
) {
    const doc = new jsPDF()

    const pageWidth =
        doc.internal.pageSize.width

    const pageHeight =
        doc.internal.pageSize.height

    /* =========================
       COLORS
    ========================= */

    const dark: [
        number,
        number,
        number
    ] = [10, 15, 30]

    const violet: [
        number,
        number,
        number
    ] = [124, 58, 237]

    const cyan: [
        number,
        number,
        number
    ] = [6, 182, 212]

    const green: [
        number,
        number,
        number
    ] = [34, 197, 94]

    const red: [
        number,
        number,
        number
    ] = [239, 68, 68]

    const slate: [
        number,
        number,
        number
    ] = [71, 85, 105]

    /* =========================
       HEADER
    ========================= */

    doc.setFillColor(
        dark[0],
        dark[1],
        dark[2]
    )

    doc.rect(
        0,
        0,
        pageWidth,
        50,
        "F"
    )

    // Accent Glow

    doc.setFillColor(
        violet[0],
        violet[1],
        violet[2]
    )

    doc.circle(
        pageWidth - 20,
        10,
        20,
        "F"
    )

    doc.setFillColor(
        cyan[0],
        cyan[1],
        cyan[2]
    )

    doc.circle(
        pageWidth - 50,
        35,
        15,
        "F"
    )

    // Title

    doc.setTextColor(
        255,
        255,
        255
    )

    doc.setFont(
        "helvetica",
        "bold"
    )

    doc.setFontSize(28)

    doc.text(
        "AI Financial Report",
        20,
        25
    )

    doc.setFontSize(12)

    doc.setFont(
        "helvetica",
        "normal"
    )

    doc.setTextColor(
        200,
        200,
        200
    )

    doc.text(
        "Smart Expense Analytics & AI Insights",
        20,
        35
    )

    doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        20,
        43
    )

    /* =========================
       CALCULATIONS
    ========================= */

    const income = expenses
        .filter(
            (e) => e.type === "income"
        )
        .reduce(
            (acc, curr) =>
                acc +
                Number(curr.amount),
            0
        )

    const expense = expenses
        .filter(
            (e) => e.type === "expense"
        )
        .reduce(
            (acc, curr) =>
                acc +
                Number(curr.amount),
            0
        )

    const savings =
        income - expense

    /* =========================
       OVERVIEW TITLE
    ========================= */

    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    )

    doc.setFontSize(20)

    doc.setFont(
        "helvetica",
        "bold"
    )

    doc.text(
        "Financial Overview",
        20,
        70
    )

    /* =========================
       METRIC CARDS
    ========================= */

    const cards = [
        {
            title: "Total Income",
            value: `$${income}`,
            color: green,
        },

        {
            title: "Expenses",
            value: `$${expense}`,
            color: red,
        },

        {
            title: "Savings",
            value: `$${savings}`,
            color: violet,
        },
    ]

    let x = 20

    cards.forEach((card) => {
        doc.setFillColor(
            card.color[0],
            card.color[1],
            card.color[2]
        )

        doc.roundedRect(
            x,
            80,
            52,
            34,
            8,
            8,
            "F"
        )

        doc.setTextColor(
            255,
            255,
            255
        )

        doc.setFontSize(11)

        doc.setFont(
            "helvetica",
            "normal"
        )

        doc.text(
            card.title,
            x + 6,
            93
        )

        doc.setFontSize(18)

        doc.setFont(
            "helvetica",
            "bold"
        )

        doc.text(
            card.value,
            x + 6,
            106
        )

        x += 58
    })

    /* =========================
       HEALTH SCORE
    ========================= */

    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    )

    doc.setFontSize(20)

    doc.text(
        "Financial Health",
        20,
        135
    )

    doc.setFillColor(
        248,
        250,
        252
    )

    doc.roundedRect(
        20,
        143,
        170,
        34,
        8,
        8,
        "F"
    )

    // Score Circle

    doc.setFillColor(
        cyan[0],
        cyan[1],
        cyan[2]
    )

    doc.circle(
        38,
        160,
        10,
        "F"
    )

    doc.setTextColor(
        255,
        255,
        255
    )

    doc.setFontSize(12)

    doc.text(
        `${healthScore}`,
        33,
        163
    )

    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    )

    doc.setFontSize(15)

    doc.setFont(
        "helvetica",
        "bold"
    )

    doc.text(
        `Financial Score: ${healthScore}/100`,
        55,
        158
    )

    doc.setFontSize(11)

    doc.setFont(
        "helvetica",
        "normal"
    )

    doc.setTextColor(
        slate[0],
        slate[1],
        slate[2]
    )

    doc.text(
        "AI evaluated your spending behavior and savings efficiency.",
        55,
        166
    )

    /* =========================
       AI INSIGHTS
    ========================= */

    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    )

    doc.setFontSize(20)

    doc.setFont(
        "helvetica",
        "bold"
    )

    doc.text(
        "AI Insights",
        20,
        195
    )

    doc.setFillColor(
        248,
        250,
        252
    )

    doc.roundedRect(
        20,
        203,
        170,
        52,
        8,
        8,
        "F"
    )

    const splitInsights =
        doc.splitTextToSize(
            aiInsights,
            155
        )

    doc.setFontSize(11)

    doc.setTextColor(
        55,
        65,
        81
    )

    doc.text(
        splitInsights,
        28,
        215
    )

    /* =========================
       TRANSACTIONS TABLE
    ========================= */

    autoTable(doc, {
        startY: 270,

        margin: {
            left: 20,
            right: 20,
        },

        head: [
            [
                "Category",
                "Description",
                "Amount",
                "Type",
            ],
        ],

        body: expenses.map(
            (expense) => [
                expense.category,
                expense.description ||
                "-",
                `$${expense.amount}`,
                expense.type,
            ]
        ),

        styles: {
            fontSize: 10,

            cellPadding: 5,

            lineColor: [
                230,
                230,
                230,
            ],

            lineWidth: 0.2,
        },

        headStyles: {
            fillColor: dark,

            textColor: [
                255,
                255,
                255,
            ],

            fontStyle: "bold",

            halign: "center",
        },

        alternateRowStyles: {
            fillColor: [
                248,
                250,
                252,
            ],
        },

        bodyStyles: {
            textColor: [31, 41, 55],
        },

        columnStyles: {
            2: {
                halign: "right",
            },

            3: {
                halign: "center",
            },
        },
    })

    /* =========================
       FOOTER
    ========================= */

    doc.setDrawColor(
        230,
        230,
        230
    )

    doc.line(
        20,
        pageHeight - 18,
        pageWidth - 20,
        pageHeight - 18
    )

    doc.setFontSize(10)

    doc.setTextColor(
        120,
        120,
        120
    )

    doc.text(
        "Generated by SmartExpense AI • Premium Financial Intelligence Platform",
        20,
        pageHeight - 10
    )

    /* =========================
       SAVE
    ========================= */

    doc.save(
        `smartexpense-report-${Date.now()}.pdf`
    )
}