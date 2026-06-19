"use client"

import {
    useEffect,
    useState,
} from "react"

import ReactMarkdown from "react-markdown"

import {
    Sparkles,
    RefreshCcw,
} from "lucide-react"

import { Expense } from "@/types/expense"
import { useDashboard } from "@/components/providers/dashboard-provider"

export default function AIInsights({
    expenses,
}: {
    expenses: Expense[]
}) {
    const { aiInsights, setAiInsights } = useDashboard()
    const [loading, setLoading] = useState(false)

    const insights = aiInsights

    async function generateInsights(force = false) {
        if (aiInsights && !force) return

        try {
            setLoading(true)

            const response = await fetch(
                "/api/ai-insights",
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

            const data = await response.json()
            setAiInsights(data.insights)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (expenses.length > 0) {
            generateInsights(false)
        }
    }, [expenses, aiInsights])

    return (
        <div>
            {/* Header */}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20">
                        <Sparkles className="text-cyan-400" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold">
                            AI Financial Insights
                        </h2>

                        <p className="text-zinc-400 mt-1">
                            Personalized AI-powered financial intelligence
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => generateInsights(true)}
                    className="group flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-3 rounded-2xl transition-all"
                >
                    <RefreshCcw
                        size={18}
                        className="group-hover:rotate-180 transition duration-500"
                    />

                    Refresh AI
                </button>
            </div>

            {/* Content */}

            {loading ? (
                <div className="space-y-5">
                    <div className="h-5 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-5 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-5 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-5 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-5 bg-white/5 rounded-full animate-pulse" />
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-10 backdrop-blur-xl">
                    {/* Glow */}

                    <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-[120px]" />

                    <div className="relative z-10 prose prose-invert max-w-none">
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
                                    <h2 className="text-2xl font-bold mt-10 mb-5 text-cyan-300 flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400" />

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
                                    <li className="flex items-start gap-3 text-zinc-300 leading-8">
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
                            {insights}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    )
}