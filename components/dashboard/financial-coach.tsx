"use client"

import {
    useEffect,
    useState,
} from "react"

import ReactMarkdown from "react-markdown"

import { motion } from "framer-motion"

import {
    Brain,
    Sparkles,
    RefreshCcw,
    TrendingUp,
} from "lucide-react"

import { Expense } from "@/types/expense"
import { useDashboard } from "@/components/providers/dashboard-provider"

export default function FinancialCoach({
    expenses,
}: {
    expenses: Expense[]
}) {
    const { financialCoachAdvice, setFinancialCoachAdvice } = useDashboard()
    const [loading, setLoading] = useState(false)

    const coach = financialCoachAdvice

    /* =========================
       LOAD COACH
     ========================= */

    async function loadCoach(force = false) {
        if (financialCoachAdvice && !force) return

        try {
            setLoading(true)

            const response =
                await fetch(
                    "/api/financial-coach",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            expenses,
                        }),
                    }
                )

            const data =
                await response.json()

            setFinancialCoachAdvice(data.coaching)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    /* =========================
       INITIAL LOAD
     ========================= */

    useEffect(() => {
        if (expenses.length > 0) {
            loadCoach(false)
        }
    }, [expenses, financialCoachAdvice])

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            whileHover={{
                y: -6,
            }}
            transition={{
                duration: 0.4,
            }}
            className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-transparent p-10 backdrop-blur-2xl"
        >
            {/* Glow Effects */}

            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[140px]" />

            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 blur-[120px]" />

            {/* Header */}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Brain className="text-violet-400" size={30} />
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-5">
                            <Sparkles size={14} />

                            AI Powered Financial Intelligence
                        </div>

                        <h2 className="text-4xl font-black tracking-tight">
                            Smart Financial Coach
                        </h2>

                        <p className="text-zinc-400 mt-3 text-lg leading-8 max-w-3xl">
                            Personalized AI coaching designed to improve your spending habits, optimize savings, and strengthen long-term financial growth.
                        </p>
                    </div>
                </div>

                {/* Refresh Button */}

                <button
                    onClick={() => loadCoach(true)}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-7 py-4 rounded-3xl font-semibold flex items-center gap-3 hover:scale-[1.03] transition-all shadow-lg shadow-violet-500/20"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

                    <RefreshCcw
                        size={18}
                        className={`transition-transform duration-500 ${loading
                                ? "animate-spin"
                                : "group-hover:rotate-180"
                            }`}
                    />

                    {loading
                        ? "Refreshing..."
                        : "Refresh Coach"}
                </button>
            </div>

            {/* Divider */}

            <div className="relative z-10 my-10 border-t border-white/10" />

            {/* Loading */}

            {loading ? (
                <div className="relative z-10 space-y-5">
                    {[...Array(6)].map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-5 rounded-full bg-white/5 animate-pulse"
                                style={{
                                    width: `${100 -
                                        index *
                                        8
                                        }%`,
                                }}
                            />
                        )
                    )}
                </div>
            ) : (
                <div className="relative z-10">
                    {/* AI Content */}

                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({
                                    children,
                                }) => (
                                    <h1 className="text-4xl font-black mb-8 text-white tracking-tight">
                                        {children}
                                    </h1>
                                ),

                                h2: ({
                                    children,
                                }) => (
                                    <h2 className="flex items-center gap-3 text-2xl font-bold mt-12 mb-6 text-cyan-300">
                                        <TrendingUp
                                            size={
                                                20
                                            }
                                        />

                                        {children}
                                    </h2>
                                ),

                                p: ({
                                    children,
                                }) => (
                                    <p className="text-zinc-300 leading-9 text-[17px] mb-6">
                                        {children}
                                    </p>
                                ),

                                strong: ({
                                    children,
                                }) => (
                                    <strong className="text-white font-semibold">
                                        {children}
                                    </strong>
                                ),

                                ul: ({
                                    children,
                                }) => (
                                    <ul className="space-y-4 my-6">
                                        {children}
                                    </ul>
                                ),

                                li: ({
                                    children,
                                }) => (
                                    <li className="flex items-start gap-4 text-zinc-300 leading-8">
                                        <span className="mt-3 w-2 h-2 rounded-full bg-violet-400 shrink-0" />

                                        <span>
                                            {children}
                                        </span>
                                    </li>
                                ),

                                hr: () => (
                                    <div className="my-10 border-t border-white/10" />
                                ),
                            }}
                        >
                            {coach}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </motion.div>
    )
}