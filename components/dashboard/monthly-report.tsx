"use client"

import {
    useState,
} from "react"

import {
    motion,
} from "framer-motion"

import {
    Mail,
    Sparkles,
    Send,
    CheckCircle2,
} from "lucide-react"

import { Expense } from "@/types/expense"

export default function MonthlyReport({
    expenses,
    email,
}: {
    expenses: Expense[]

    email: string
}) {
    const [loading, setLoading] =
        useState(false)

    const [success, setSuccess] =
        useState(false)

    /* =========================
       SEND REPORT
    ========================= */

    async function sendReport() {
        try {
            setLoading(true)

            setSuccess(false)

            await fetch(
                "/api/send-monthly-report",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        expenses,

                        email,
                    }),
                }
            )

            setSuccess(true)

            setTimeout(() => {
                setSuccess(false)
            }, 4000)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

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
                y: -4,
            }}
            transition={{
                duration: 0.35,
            }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-transparent p-8 backdrop-blur-2xl"
        >
            {/* Glow */}

            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px]" />

            <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/10 blur-[100px]" />

            {/* CONTENT */}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                {/* LEFT */}

                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Mail
                            className="text-blue-400"
                            size={30}
                        />
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-5">
                            <Sparkles size={14} />

                            AI Generated Email Reports
                        </div>

                        <h2 className="text-4xl font-black tracking-tight">
                            Monthly AI Report
                        </h2>

                        <p className="text-zinc-400 mt-4 text-lg leading-8 max-w-2xl">
                            Deliver personalized financial analytics and AI-generated insights directly to your inbox.
                        </p>

                        {/* Email */}

                        <div className="mt-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                <Mail
                                    size={18}
                                    className="text-zinc-400"
                                />
                            </div>

                            <div>
                                <p className="text-zinc-500 text-sm">
                                    Report Destination
                                </p>

                                <p className="text-white font-medium">
                                    {email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}

                <div className="flex flex-col items-start lg:items-end gap-5">
                    {/* STATUS */}

                    {success && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                        >
                            <CheckCircle2
                                size={18}
                            />

                            Report sent successfully
                        </motion.div>
                    )}

                    {/* BUTTON */}

                    <button
                        onClick={sendReport}
                        disabled={loading}
                        className={`group relative overflow-hidden px-8 py-5 rounded-3xl text-white font-semibold flex items-center gap-4 transition-all duration-300 shadow-lg ${loading
                                ? "bg-zinc-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:scale-[1.03] shadow-violet-500/20"
                            }`}
                    >
                        {/* Shine */}

                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

                        {loading ? (
                            <>
                                <Sparkles
                                    size={20}
                                    className="animate-spin"
                                />

                                <span>
                                    Sending AI Report...
                                </span>
                            </>
                        ) : (
                            <>
                                <Send
                                    size={20}
                                    className="group-hover:translate-x-1 transition"
                                />

                                <span>
                                    Send AI Report
                                </span>
                            </>
                        )}
                    </button>

                    {/* Small Note */}

                    <p className="text-zinc-500 text-sm max-w-xs text-right leading-6">
                        Your report includes AI-powered spending analysis, savings insights, and personalized financial recommendations.
                    </p>
                </div>
            </div>
        </motion.div>
    )
}