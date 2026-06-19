"use client"

import { useState } from "react"

import {
    PlusCircle,
    Wallet,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"

import { addExpense } from "@/services/expense-service"

export default function ExpenseForm({
    onAdded,
}: {
    onAdded: () => void
}) {
    const { user } = useAuth()

    const [amount, setAmount] =
        useState("")

    const [category, setCategory] =
        useState("Food")

    const [description, setDescription] =
        useState("")

    const [type, setType] = useState<
        "income" | "expense"
    >("expense")

    const [loading, setLoading] =
        useState(false)

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault()

        if (!user) return

        try {
            setLoading(true)

            await addExpense({
                user_id: user.id,
                amount: Number(amount),
                category,
                description,
                type,
                date: new Date().toISOString(),
                is_recurring: false,
            })

            setAmount("")
            setDescription("")

            onAdded()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                    <Wallet className="text-violet-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Add Transaction
                    </h2>

                    <p className="text-zinc-400">
                        Track income and expenses
                    </p>
                </div>
            </div>

            <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                    Amount
                </label>

                <input
                    type="number"
                    placeholder="$0.00"
                    value={amount}
                    onChange={(e) =>
                        setAmount(e.target.value)
                    }
                    className="w-full px-5 py-4"
                    required
                />
            </div>

            <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                    Category
                </label>

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                    className="w-full px-5 py-4"
                >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Bills</option>
                    <option>Salary</option>
                </select>
            </div>

            <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                    Description
                </label>

                <input
                    type="text"
                    placeholder="Enter transaction details..."
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    className="w-full px-5 py-4"
                />
            </div>

            <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                    Transaction Type
                </label>

                <select
                    value={type}
                    onChange={(e) =>
                        setType(
                            e.target.value as
                            | "income"
                            | "expense"
                        )
                    }
                    className="w-full px-5 py-4"
                >
                    <option value="expense">
                        Expense
                    </option>

                    <option value="income">
                        Income
                    </option>
                </select>
            </div>

            <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
                <PlusCircle size={18} />

                {loading
                    ? "Adding..."
                    : "Add Transaction"}
            </button>
        </form>
    )
}