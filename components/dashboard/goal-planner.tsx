"use client"

import {
    useState,
} from "react"

import { motion } from "framer-motion"

import {
    Sparkles,
    Target,
    Trash2,
    TrendingUp,
} from "lucide-react"

import {
    useGoalsStore,
} from "@/store/goals-store"

export default function GoalPlanner() {
    const {
        goals,
        addGoal,
        removeGoal,
    } = useGoalsStore()

    const [title, setTitle] =
        useState("")

    const [targetAmount, setTargetAmount] =
        useState("")

    const [currentAmount, setCurrentAmount] =
        useState("")

    const [deadline, setDeadline] =
        useState("")

    function handleAddGoal() {
        if (
            !title ||
            !targetAmount ||
            !deadline
        ) {
            return
        }

        addGoal({
            title,

            target_amount:
                Number(targetAmount),

            current_amount:
                Number(
                    currentAmount || 0
                ),

            target_date: deadline,
            deadline,
        })

        setTitle("")

        setTargetAmount("")

        setCurrentAmount("")

        setDeadline("")
    }

    return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-8 backdrop-blur-2xl">
            {/* Glow */}

            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[120px]" />

            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[100px]" />

            {/* HEADER */}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300 mb-5">
                        <Sparkles
                            size={14}
                            className="text-cyan-400"
                        />

                        AI Smart Goal Planning
                    </div>

                    <h2 className="text-5xl font-black tracking-tight">
                        Savings Goals
                    </h2>

                    <p className="text-zinc-400 mt-4 text-lg leading-8 max-w-2xl">
                        Create intelligent financial goals, monitor progress, and receive AI-powered savings recommendations.
                    </p>
                </div>

                {/* Goals Count */}

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-6 backdrop-blur-xl">
                    <p className="text-zinc-500 text-sm">
                        Active Goals
                    </p>

                    <h3 className="text-5xl font-black mt-3 text-cyan-400">
                        {goals.length}
                    </h3>
                </div>
            </div>

            {/* FORM */}

            <div className="relative z-10 mt-10 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-xl">
                <div className="grid lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Goal Title"
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
                            )
                        }
                        className="px-5 py-4"
                    />

                    <input
                        type="number"
                        placeholder="Target Amount"
                        value={targetAmount}
                        onChange={(e) =>
                            setTargetAmount(
                                e.target.value
                            )
                        }
                        className="px-5 py-4"
                    />

                    <input
                        type="number"
                        placeholder="Current Savings"
                        value={currentAmount}
                        onChange={(e) =>
                            setCurrentAmount(
                                e.target.value
                            )
                        }
                        className="px-5 py-4"
                    />

                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) =>
                            setDeadline(
                                e.target.value
                            )
                        }
                        className="px-5 py-4"
                    />
                </div>

                <button
                    onClick={handleAddGoal}
                    className="mt-6 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 text-white px-7 py-4 rounded-2xl font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-violet-500/20"
                >
                    Create Smart Goal
                </button>
            </div>

            {/* GOALS */}

            <div className="relative z-10 grid lg:grid-cols-2 gap-6 mt-10">
                {goals.map((goal) => {
                    const progress =
                        (goal.current_amount /
                            goal.target_amount) *
                        100

                    const remaining =
                        goal.target_amount -
                        goal.current_amount

                    return (
                        <motion.div
                            key={goal.title}
                            whileHover={{
                                y: -5,
                            }}
                            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 backdrop-blur-xl hover:border-white/20 transition-all"
                        >
                            {/* Glow */}

                            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 blur-[100px]" />

                            {/* TOP */}

                            <div className="relative z-10 flex items-start justify-between gap-5">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                            <Target className="text-violet-300" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold">
                                                {goal.title}
                                            </h3>

                                            <p className="text-zinc-500 text-sm mt-1">
                                                Deadline:{" "}
                                                {
                                                    goal.deadline
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        removeGoal(
                                            goal.title
                                        )
                                    }
                                    className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2
                                        size={18}
                                    />
                                </button>
                            </div>

                            {/* PROGRESS */}

                            <div className="relative z-10 mt-8">
                                <div className="flex justify-between text-sm text-zinc-400 mb-3">
                                    <span>
                                        Goal Progress
                                    </span>

                                    <span className="text-cyan-400 font-semibold">
                                        {progress.toFixed(
                                            0
                                        )}
                                        %
                                    </span>
                                </div>

                                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{
                                            width: 0,
                                        }}
                                        animate={{
                                            width: `${progress}%`,
                                        }}
                                        transition={{
                                            duration: 1,
                                        }}
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 shadow-lg shadow-violet-500/30"
                                    />
                                </div>
                            </div>

                            {/* STATS */}

                            <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-zinc-500 text-xs">
                                        Target
                                    </p>

                                    <h4 className="text-lg font-bold mt-2">
                                        $
                                        {
                                            goal.target_amount
                                        }
                                    </h4>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-zinc-500 text-xs">
                                        Saved
                                    </p>

                                    <h4 className="text-lg font-bold mt-2 text-cyan-400">
                                        $
                                        {
                                            goal.current_amount
                                        }
                                    </h4>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-zinc-500 text-xs">
                                        Remaining
                                    </p>

                                    <h4 className="text-lg font-bold mt-2 text-yellow-400">
                                        $
                                        {remaining}
                                    </h4>
                                </div>
                            </div>

                            {/* AI COACH */}

                            <div className="relative z-10 mt-7 rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                        <TrendingUp className="text-cyan-400" size={18} />
                                    </div>

                                    <div>
                                        <p className="text-cyan-300 text-sm font-medium uppercase tracking-[0.2em]">
                                            AI Coaching
                                        </p>
                                    </div>
                                </div>

                                <p className="text-zinc-300 leading-8 text-[15px]">
                                    To achieve this goal by{" "}
                                    <strong className="text-white">
                                        {
                                            goal.deadline
                                        }
                                    </strong>
                                    , try saving approximately{" "}
                                    <strong className="text-cyan-400">
                                        $
                                        {(
                                            remaining /
                                            6
                                        ).toFixed(
                                            0
                                        )}
                                        /month
                                    </strong>{" "}
                                    while minimizing unnecessary spending and increasing automated savings contributions.
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}