"use client"

import { Trash2 } from "lucide-react"

import { Expense } from "@/types/expense"

import { deleteExpense } from "@/services/expense-service"

export default function ExpenseList({
    expenses,
    refresh,
}: {
    expenses: Expense[]
    refresh: () => void
}) {
    async function handleDelete(id: string) {
        await deleteExpense(id)
        refresh()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">
                        Recent Transactions
                    </h2>

                    <p className="text-zinc-400 mt-2">
                        Track your latest financial activity
                    </p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300">
                    {expenses.length} Transactions
                </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {expenses.map((expense) => (
                    <div
                        key={expense.id}
                        className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 p-5"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${expense.type === "income"
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-red-500/15 text-red-400"
                                    }`}
                            >
                                {expense.type === "income"
                                    ? "+"
                                    : "-"}
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg">
                                    {expense.description ||
                                        expense.category}
                                </h3>

                                <p className="text-sm text-zinc-400 mt-1">
                                    {expense.category}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="text-right">
                                <p
                                    className={`text-xl font-bold ${expense.type === "income"
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                        }`}
                                >
                                    {expense.type === "income"
                                        ? "+"
                                        : "-"}
                                    ${expense.amount}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    handleDelete(expense.id)
                                }
                                className="opacity-0 group-hover:opacity-100 transition bg-red-500/10 hover:bg-red-500/20 text-red-400 p-3 rounded-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {expenses.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-3xl py-20 text-center">
                        <p className="text-zinc-400 text-lg">
                            No transactions found
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}