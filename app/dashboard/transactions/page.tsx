"use client"

import { Receipt, Sparkles } from "lucide-react"

import ExpenseForm from "@/components/forms/expense-form"
import ExpenseList from "@/components/dashboard/expense-list"
import CSVManager from "@/components/dashboard/csv-manager"
import { useDashboard } from "@/components/providers/dashboard-provider"
import FadeIn from "@/components/shared/fade-in"

export default function TransactionsPage() {
    const { expenses, loadExpenses } = useDashboard()

    return (
        <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-6">
            {/* HEADER */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <Receipt className="text-violet-400" size={22} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-2">
                                <Sparkles size={12} />
                                Transaction Management
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight">
                                Transactions
                            </h1>

                            <p className="text-zinc-400 mt-1.5 text-sm">
                                Add and manage your daily transactions, search or filter history, and perform bulk CSV actions.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* TRANSACTIONS COMPONENTS STACKED VERTICALLY */}
            <div className="space-y-12">
                {/* Add Transaction Form */}
                <FadeIn delay={0.1}>
                    <div className="glass-card p-8">
                        <ExpenseForm onAdded={loadExpenses} />
                    </div>
                </FadeIn>

                {/* Transaction List Table */}
                <FadeIn delay={0.15}>
                    <div className="glass-card p-8">
                        <ExpenseList
                            expenses={expenses}
                            refresh={loadExpenses}
                        />
                    </div>
                </FadeIn>

                {/* CSV Import/Export Manager */}
                <FadeIn delay={0.2}>
                    <div className="glass-card p-8">
                        <CSVManager
                            expenses={expenses}
                            refresh={loadExpenses}
                        />
                    </div>
                </FadeIn>
            </div>
        </div>
    )
}
