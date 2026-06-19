"use client"

import {
    TrendingUp,
    ShieldCheck,
} from "lucide-react"

import { Expense } from "@/types/expense"

import {
    calculateFinancialHealth,
} from "@/utils/financial-health"

export default function FinancialHealth({
    expenses,
}: {
    expenses: Expense[]
}) {
    const health =
        calculateFinancialHealth(
            expenses
        )

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                    <ShieldCheck className="text-emerald-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Financial Health
                    </h2>

                    <p className="text-zinc-400">
                        AI generated financial score
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center">
                <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                    <div className="absolute inset-4 rounded-full border border-white/10 bg-black/30 backdrop-blur-xl" />

                    <div className="relative text-center">
                        <h3 className="text-6xl font-bold text-white">
                            {health.score}
                        </h3>

                        <p className="text-zinc-400 mt-2">
                            {health.status}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mt-10">
                {health.tips.map(
                    (tip, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                            <TrendingUp
                                className="text-cyan-400 mt-1"
                                size={18}
                            />

                            <p className="text-zinc-300 leading-relaxed">
                                {tip}
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}