"use client"

import { useState } from "react"

import {
    Download,
    Upload,
    FileSpreadsheet,
} from "lucide-react"

import {
    exportExpensesToCSV,
} from "@/utils/export-csv"

import { parseCSV } from "@/utils/import-csv"

import { addExpense } from "@/services/expense-service"

import { Expense } from "@/types/expense"

import { useAuth } from "@/components/providers/auth-provider"

export default function CSVManager({
    expenses,
    refresh,
}: {
    expenses: Expense[]
    refresh: () => void
}) {
    const { user } = useAuth()

    const [loading, setLoading] =
        useState(false)

    async function handleImport(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file =
            e.target.files?.[0]

        if (!file || !user)
            return

        try {
            setLoading(true)

            const rows =
                await parseCSV(file)

            for (const row of rows) {
                await addExpense({
                    user_id: user.id,
                    amount: Number(
                        row.amount || 0
                    ),
                    category:
                        row.category ||
                        "Other",
                    description:
                        row.description ||
                        "Imported Expense",
                    date:
                        row.date ||
                        new Date().toISOString(),
                    type:
                        row.type ||
                        "expense",
                    is_recurring:
                        row.is_recurring ===
                        "true",
                })
            }

            refresh()

            alert(
                "CSV imported successfully!"
            )
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                    <FileSpreadsheet className="text-emerald-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        CSV Manager
                    </h2>

                    <p className="text-zinc-400">
                        Import and export financial data
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <button
                    onClick={() =>
                        exportExpensesToCSV(
                            expenses
                        )
                    }
                    className="group bg-gradient-to-r from-violet-600 to-cyan-500 rounded-3xl p-6 text-left hover:scale-[1.02]"
                >
                    <Download className="text-white mb-5" />

                    <h3 className="text-2xl font-bold text-white">
                        Export CSV
                    </h3>

                    <p className="text-white/70 mt-2">
                        Download your expense history instantly
                    </p>
                </button>

                <label className="group cursor-pointer bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.06] transition">
                    <Upload className="text-cyan-400 mb-5" />

                    <h3 className="text-2xl font-bold">
                        {loading
                            ? "Importing..."
                            : "Import CSV"}
                    </h3>

                    <p className="text-zinc-400 mt-2">
                        Upload transactions using CSV files
                    </p>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={
                            handleImport
                        }
                        className="hidden"
                    />
                </label>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
                Required CSV columns:
                <span className="text-white ml-2">
                    amount, category,
                    description, date,
                    type, is_recurring
                </span>
            </div>
        </div>
    )
}