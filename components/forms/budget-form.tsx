"use client"

import { useState } from "react"

import {
    PiggyBank,
    Save,
    ChevronDown,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"

import { addBudget } from "@/services/budget-service"

export default function BudgetForm({
    refresh,
}: {
    refresh: () => void
}) {
    const { user } = useAuth()

    const [category, setCategory] =
        useState("Food")

    const [limit, setLimit] =
        useState("")

    const [loading, setLoading] =
        useState(false)

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault()

        if (!user) return

        try {
            setLoading(true)

            await addBudget({
                user_id: user.id,
                category,
                monthly_limit:
                    Number(limit),
            })

            setLimit("")

            refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Header */}

            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-3xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20">
                    <PiggyBank className="text-cyan-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Budget Planner
                    </h2>

                    <p className="text-zinc-400 mt-1">
                        Set intelligent monthly spending limits
                    </p>
                </div>
            </div>

            {/* Category */}

            <div>
                <label className="text-sm text-zinc-400 mb-3 block">
                    Budget Category
                </label>

                <div className="relative">
                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                        className="w-full px-5 py-4 pr-14 bg-white/[0.04] border border-white/10 rounded-2xl text-white appearance-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none"
                    >
                        <option value="Food">
                            Food
                        </option>

                        <option value="Travel">
                            Travel
                        </option>

                        <option value="Shopping">
                            Shopping
                        </option>

                        <option value="Bills">
                            Bills
                        </option>

                        <option value="Entertainment">
                            Entertainment
                        </option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-zinc-400">
                        <ChevronDown
                            size={18}
                        />
                    </div>
                </div>
            </div>

            {/* Limit */}

            <div>
                <label className="text-sm text-zinc-400 mb-3 block">
                    Monthly Limit
                </label>

                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400">
                        $
                    </span>

                    <input
                        type="number"
                        placeholder="0.00"
                        value={limit}
                        onChange={(e) =>
                            setLimit(
                                e.target.value
                            )
                        }
                        className="w-full pl-10 pr-5 py-4 bg-white/[0.04] border border-white/10 rounded-2xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none"
                        required
                    />
                </div>
            </div>

            {/* Submit */}

            <button
                disabled={loading}
                className="group relative overflow-hidden w-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

                <Save size={18} />

                <span>
                    {loading
                        ? "Saving Budget..."
                        : "Save Budget"}
                </span>
            </button>
        </form>
    )
}