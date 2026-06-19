"use client"

import { useState } from "react"

import {
    FileText,
    Sparkles,
} from "lucide-react"

import { Expense } from "@/types/expense"

import {
    calculateFinancialHealth,
} from "@/utils/financial-health"

import {
    generateFinancialReport,
} from "@/utils/pdf-report"

export default function PDFReport({
    expenses,
}: {
    expenses: Expense[]
}) {
    const [loading, setLoading] =
        useState(false)

    const health =
        calculateFinancialHealth(
            expenses
        )

    async function handleGenerate() {
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

            const data =
                await response.json()

            const aiInsights =
                data.insights ||
                "No AI insights available."

            generateFinancialReport(
                expenses,
                aiInsights,
                health.score
            )
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 px-6 py-3 text-white font-semibold flex items-center gap-3 shadow-lg shadow-violet-500/20"
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

            {loading ? (
                <>
                    <Sparkles
                        size={18}
                        className="animate-spin"
                    />

                    <span>
                        Generating...
                    </span>
                </>
            ) : (
                <>
                    <FileText size={18} />

                    <span>
                        AI PDF Report
                    </span>
                </>
            )}
        </button>
    )
}