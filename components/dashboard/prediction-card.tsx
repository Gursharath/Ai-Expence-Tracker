"use client"

import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
} from "lucide-react"

import { Expense } from "@/types/expense"

import { generatePredictions } from "@/utils/predictions"

export default function PredictionCard({
    expenses,
}: {
    expenses: Expense[]
}) {
    const predictions =
        generatePredictions(
            expenses
        )

    const cards = [
        {
            title:
                "Predicted Expenses",
            value:
                predictions.predictedExpense,
            icon: TrendingDown,
            color:
                "text-red-400",
            bg: "bg-red-500/10",
        },

        {
            title:
                "Predicted Income",
            value:
                predictions.predictedIncome,
            icon: TrendingUp,
            color:
                "text-emerald-400",
            bg: "bg-emerald-500/10",
        },

        {
            title:
                "Predicted Savings",
            value:
                predictions.predictedSavings,
            icon: Wallet,
            color:
                "text-cyan-400",
            bg: "bg-cyan-500/10",
        },
    ]

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold">
                    AI Expense Prediction
                </h2>

                <p className="text-zinc-400 mt-2">
                    Smart AI future spending analysis
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
                {cards.map((card) => {
                    const Icon =
                        card.icon

                    return (
                        <div
                            key={card.title}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                        >
                            <div
                                className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-5`}
                            >
                                <Icon
                                    className={
                                        card.color
                                    }
                                />
                            </div>

                            <p className="text-zinc-400">
                                {card.title}
                            </p>

                            <h3
                                className={`text-4xl font-bold mt-3 ${card.color}`}
                            >
                                $
                                {card.value}
                            </h3>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-zinc-400 text-sm">
                    Highest Spending Category
                </p>

                <h3 className="text-2xl font-bold mt-3">
                    {predictions.topCategory}
                </h3>
            </div>

            <div className="mt-6 flex gap-4 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                <AlertTriangle className="text-yellow-400 shrink-0 mt-1" />

                <div>
                    <h4 className="font-semibold text-yellow-300">
                        AI Prediction Insight
                    </h4>

                    <p className="text-zinc-300 mt-2 leading-relaxed">
                        {predictions.warning}
                    </p>
                </div>
            </div>
        </div>
    )
}