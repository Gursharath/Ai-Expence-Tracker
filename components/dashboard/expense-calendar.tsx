"use client"

import {
    useMemo,
    useState,
} from "react"

import Calendar from "react-calendar"

import {
    CalendarDays,
    TrendingUp,
    Wallet,
    Sparkles,
} from "lucide-react"

import { motion } from "framer-motion"

import "react-calendar/dist/Calendar.css"

import { Expense } from "@/types/expense"

export default function ExpenseCalendar({
    expenses,
}: {
    expenses: Expense[]
}) {
    const [selectedDate, setSelectedDate] =
        useState<Date>(
            new Date()
        )

    /* =========================
       FILTER EXPENSES
    ========================= */

    const filteredExpenses =
        useMemo(() => {
            return expenses.filter(
                (expense) => {
                    const expenseDate =
                        new Date(
                            expense.date
                        )

                    return (
                        expenseDate.toDateString() ===
                        selectedDate.toDateString()
                    )
                }
            )
        }, [expenses, selectedDate])

    /* =========================
       TOTALS
    ========================= */

    const dailyTotal =
        filteredExpenses.reduce(
            (acc, curr) =>
                acc + Number(curr.amount),
            0
        )

    const incomeTotal =
        filteredExpenses
            .filter(
                (e) =>
                    e.type ===
                    "income"
            )
            .reduce(
                (acc, curr) =>
                    acc +
                    Number(curr.amount),
                0
            )

    const expenseTotal =
        filteredExpenses
            .filter(
                (e) =>
                    e.type ===
                    "expense"
            )
            .reduce(
                (acc, curr) =>
                    acc +
                    Number(curr.amount),
                0
            )

    return (
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-transparent p-8 backdrop-blur-2xl">
            {/* Glow */}

            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[140px]" />

            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 blur-[120px]" />

            {/* HEADER */}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <CalendarDays className="text-violet-400" size={30} />
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-5">
                            <Sparkles size={14} />

                            Smart Calendar Analytics
                        </div>

                        <h2 className="text-4xl font-black tracking-tight">
                            Expense Calendar
                        </h2>

                        <p className="text-zinc-400 mt-3 text-lg leading-8 max-w-3xl">
                            Analyze daily financial activity, track transactions,
                            and visualize spending patterns with intelligent
                            calendar insights.
                        </p>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}

            <div className="relative z-10 grid xl:grid-cols-[1.2fr_1fr] gap-8">
                {/* CALENDAR */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="rounded-[32px] border border-white/10 bg-black/20 p-6 backdrop-blur-xl overflow-hidden"
                >
                    <Calendar
                        onChange={(value) =>
                            setSelectedDate(
                                value as Date
                            )
                        }
                        value={selectedDate}
                        className="premium-calendar"
                        prev2Label={null}
                        next2Label={null}
                    />
                </motion.div>

                {/* RIGHT SIDE */}

                <div className="space-y-6">
                    {/* SUMMARY */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.1,
                        }}
                        className="rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20 p-8"
                    >
                        <p className="text-zinc-400 text-sm uppercase tracking-[0.25em]">
                            Selected Date
                        </p>

                        <h3 className="text-3xl font-black mt-4 leading-tight">
                            {selectedDate.toDateString()}
                        </h3>

                        {/* STATS */}

                        <div className="grid grid-cols-2 gap-5 mt-8">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="text-zinc-400 text-sm">
                                    Transactions
                                </p>

                                <h4 className="text-3xl font-bold mt-3">
                                    {
                                        filteredExpenses.length
                                    }
                                </h4>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="text-zinc-400 text-sm">
                                    Daily Total
                                </p>

                                <h4 className="text-3xl font-bold mt-3 text-emerald-400">
                                    ${dailyTotal}
                                </h4>
                            </div>
                        </div>

                        {/* EXTRA STATS */}

                        <div className="grid grid-cols-2 gap-5 mt-5">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="flex items-center gap-3">
                                    <TrendingUp
                                        className="text-cyan-400"
                                        size={
                                            20
                                        }
                                    />

                                    <div>
                                        <p className="text-zinc-400 text-sm">
                                            Income
                                        </p>

                                        <h4 className="text-xl font-bold mt-1 text-cyan-400">
                                            $
                                            {
                                                incomeTotal
                                            }
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="flex items-center gap-3">
                                    <Wallet
                                        className="text-red-400"
                                        size={
                                            20
                                        }
                                    />

                                    <div>
                                        <p className="text-zinc-400 text-sm">
                                            Expenses
                                        </p>

                                        <h4 className="text-xl font-bold mt-1 text-red-400">
                                            $
                                            {
                                                expenseTotal
                                            }
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* TRANSACTIONS */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.2,
                        }}
                        className="space-y-4 max-h-[450px] overflow-y-auto pr-2"
                    >
                        {filteredExpenses.length ===
                            0 ? (
                            <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-10 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-white/5 mx-auto flex items-center justify-center mb-5">
                                    <CalendarDays className="text-zinc-500" />
                                </div>

                                <h4 className="text-2xl font-bold">
                                    No Transactions
                                </h4>

                                <p className="text-zinc-400 mt-3 leading-7">
                                    No financial activity was recorded for this selected date.
                                </p>
                            </div>
                        ) : (
                            filteredExpenses.map(
                                (
                                    expense,
                                    index
                                ) => (
                                    <motion.div
                                        key={
                                            expense.id
                                        }
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            delay:
                                                index *
                                                0.05,
                                        }}
                                        className="group rounded-[28px] border border-white/10 bg-black/20 p-6 backdrop-blur-xl hover:border-white/20 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-5">
                                            <div>
                                                <p className="text-xl font-bold">
                                                    {
                                                        expense.description
                                                    }
                                                </p>

                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300">
                                                        {
                                                            expense.category
                                                        }
                                                    </span>

                                                    <span
                                                        className={`text-sm font-medium ${expense.type ===
                                                            "income"
                                                            ? "text-cyan-400"
                                                            : "text-red-400"
                                                            }`}
                                                    >
                                                        {
                                                            expense.type
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                className={`text-2xl font-black ${expense.type ===
                                                    "income"
                                                    ? "text-cyan-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                $
                                                {
                                                    expense.amount
                                                }
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            )
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}