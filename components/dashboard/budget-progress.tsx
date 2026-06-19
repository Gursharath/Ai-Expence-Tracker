"use client"

import {
    AlertTriangle,
    CheckCircle2,
    Wallet,
} from "lucide-react"

import { Budget } from "@/types/budget"

import { Expense } from "@/types/expense"

export default function BudgetProgress({
    budgets,
    expenses,
}: {
    budgets: Budget[]

    expenses: Expense[]
}) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                    <Wallet className="text-emerald-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Budget Tracking
                    </h2>

                    <p className="text-zinc-400">
                        Monitor spending against your monthly budgets
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {budgets.map((budget) => {
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

                    const remaining =
                        budget.monthly_limit -
                        spent

                    const progressColor =
                        percentage > 100
                            ? "from-red-500 to-red-400"
                            : percentage > 75
                                ? "from-yellow-500 to-orange-400"
                                : "from-emerald-500 to-green-400"

                    return (
                        <div
                            key={budget.id}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {budget.category}
                                    </h3>

                                    <p className="text-zinc-400 mt-1">
                                        ${spent} spent
                                        out of $
                                        {
                                            budget.monthly_limit
                                        }
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        {Math.min(
                                            Math.round(
                                                percentage
                                            ),
                                            999
                                        )}
                                        %
                                    </p>

                                    <p className="text-zinc-400 text-sm">
                                        Budget usage
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}

                            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
                                    style={{
                                        width: `${Math.min(
                                            percentage,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>

                            {/* Bottom Status */}

                            <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
                                {percentage > 100 ? (
                                    <div className="flex items-center gap-2 text-red-400">
                                        <AlertTriangle
                                            size={18}
                                        />

                                        <p className="text-sm font-medium">
                                            Budget exceeded
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2
                                            size={18}
                                        />

                                        <p className="text-sm font-medium">
                                            Budget under control
                                        </p>
                                    </div>
                                )}

                                <div className="text-sm text-zinc-400">
                                    Remaining:
                                    <span className="text-white font-semibold ml-2">
                                        $
                                        {Math.max(
                                            remaining,
                                            0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {budgets.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-3xl py-20 text-center">
                        <p className="text-zinc-400 text-lg">
                            No budgets set yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}