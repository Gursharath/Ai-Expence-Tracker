"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Target, Trash2, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { getGoals, addGoal, deleteGoal } from "@/services/goal-service"
import { useAuth } from "@/components/providers/auth-provider"
import { Goal } from "@/types/goal"

export default function GoalPlanner() {
    const { user } = useAuth()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form states
    const [title, setTitle] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [currentAmount, setCurrentAmount] = useState("")
    const [deadline, setDeadline] = useState("")

    async function loadGoalsList() {
        if (!user) return
        try {
            setLoading(true)
            setError(null)
            const data = await getGoals()
            setGoals(data)
        } catch (err: any) {
            console.error("Failed to load goals:", err)
            setError("Could not load goals from database.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadGoalsList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    async function handleAddGoal() {
        if (!title || !targetAmount || !deadline || !user) {
            return
        }

        try {
            setActionLoading(true)
            setError(null)
            const newGoal: Partial<Goal> = {
                user_id: user.id,
                title,
                target_amount: Number(targetAmount),
                current_amount: Number(currentAmount || 0),
                target_date: deadline,
                status: "active",
            }

            await addGoal(newGoal)
            
            // Reset form
            setTitle("")
            setTargetAmount("")
            setCurrentAmount("")
            setDeadline("")

            // Refresh list
            await loadGoalsList()
        } catch (err: any) {
            console.error("Failed to add goal:", err)
            setError("Failed to create goal in database.")
        } finally {
            setActionLoading(false)
        }
    }

    async function handleDeleteGoal(id: string) {
        if (!id) return
        try {
            setActionLoading(true)
            setError(null)
            await deleteGoal(id)
            await loadGoalsList()
        } catch (err: any) {
            console.error("Failed to delete goal:", err)
            setError("Failed to delete goal.")
        } finally {
            setActionLoading(false)
        }
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
                        <Sparkles size={14} className="text-cyan-400" />
                        AI Smart Goal Planning
                    </div>

                    <h2 className="text-5xl font-black tracking-tight text-white">
                        Savings Goals
                    </h2>

                    <p className="text-zinc-400 mt-4 text-lg leading-8 max-w-2xl">
                        Create intelligent financial goals, monitor progress, and receive AI-powered savings recommendations.
                    </p>
                </div>

                {/* Goals Count */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-6 backdrop-blur-xl shrink-0 min-w-[150px] text-center">
                    <p className="text-zinc-500 text-sm">Active Goals</p>
                    <h3 className="text-5xl font-black mt-3 text-cyan-400">
                        {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" /> : goals.length}
                    </h3>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="relative z-10 mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2.5">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* FORM */}
            <div className="relative z-10 mt-10 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-xl">
                <div className="grid lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Goal Title (e.g. Buy Car)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-all text-sm"
                        disabled={actionLoading}
                    />

                    <input
                        type="number"
                        placeholder="Target Amount ($)"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-all text-sm"
                        disabled={actionLoading}
                    />

                    <input
                        type="number"
                        placeholder="Current Savings ($)"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-all text-sm"
                        disabled={actionLoading}
                    />

                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-all text-sm"
                        disabled={actionLoading}
                    />
                </div>

                <button
                    onClick={handleAddGoal}
                    disabled={actionLoading || !title || !targetAmount || !deadline}
                    className="mt-6 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 text-white px-7 py-4 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                    {actionLoading && <Loader2 size={16} className="animate-spin" />}
                    Create Smart Goal
                </button>
            </div>

            {/* GOALS GRID */}
            {loading ? (
                <div className="relative z-10 flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
                </div>
            ) : goals.length === 0 ? (
                <div className="relative z-10 text-center py-16 text-zinc-500">
                    <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p>No active financial goals yet. Create one above!</p>
                </div>
            ) : (
                <div className="relative z-10 grid lg:grid-cols-2 gap-6 mt-10">
                    {goals.map((goal) => {
                        const targetAmt = Number(goal.target_amount)
                        const currentAmt = Number(goal.current_amount || 0)
                        const remaining = Math.max(0, targetAmt - currentAmt)
                        const progress = targetAmt > 0 ? Math.min(100, (currentAmt / targetAmt) * 100) : 0

                        // Calculate remaining months dynamically
                        const targetDateObj = new Date(goal.target_date)
                        const today = new Date()
                        let months = (targetDateObj.getFullYear() - today.getFullYear()) * 12 + (targetDateObj.getMonth() - today.getMonth())
                        if (months <= 0) months = 1

                        const monthlyRequired = remaining > 0 ? (remaining / months).toFixed(0) : "0"

                        return (
                            <motion.div
                                key={goal.id}
                                whileHover={{ y: -5 }}
                                className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 backdrop-blur-xl hover:border-white/20 transition-all"
                            >
                                {/* Glow */}
                                <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 blur-[100px]" />

                                {/* TOP BAR */}
                                <div className="relative z-10 flex items-start justify-between gap-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                            <Target className="text-violet-300" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{goal.title}</h3>
                                            <p className="text-zinc-500 text-sm mt-1">
                                                Target Date: {new Date(goal.target_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => goal.id && handleDeleteGoal(goal.id)}
                                        disabled={actionLoading}
                                        className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* PROGRESS BAR */}
                                <div className="relative z-10 mt-8">
                                    <div className="flex justify-between text-sm text-zinc-400 mb-3">
                                        <span>Goal Progress</span>
                                        <span className="text-cyan-400 font-semibold">{progress.toFixed(0)}%</span>
                                    </div>

                                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1 }}
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 shadow-lg shadow-violet-500/30"
                                        />
                                    </div>
                                </div>

                                {/* STATS ROW */}
                                <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                                        <p className="text-zinc-500 text-xs">Target</p>
                                        <h4 className="text-lg font-bold mt-2 text-white">${targetAmt.toLocaleString()}</h4>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                                        <p className="text-zinc-500 text-xs">Saved</p>
                                        <h4 className="text-lg font-bold mt-2 text-cyan-400">${currentAmt.toLocaleString()}</h4>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                                        <p className="text-zinc-500 text-xs">Remaining</p>
                                        <h4 className="text-lg font-bold mt-2 text-yellow-400">${remaining.toLocaleString()}</h4>
                                    </div>
                                </div>

                                {/* AI COACH WIDGET */}
                                <div className="relative z-10 mt-7 rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                            <TrendingUp className="text-cyan-400" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-cyan-300 text-sm font-medium uppercase tracking-[0.2em]">
                                                AI Savings Coaching
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-zinc-300 leading-8 text-[15px]">
                                        To achieve this goal by <strong className="text-white">{new Date(goal.target_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</strong> ({months} mo), save approximately <strong className="text-cyan-400">${Number(monthlyRequired).toLocaleString()}/month</strong>. Minimize discretionary costs to fund this savings stream.
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}