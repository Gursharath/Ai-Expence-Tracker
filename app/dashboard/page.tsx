"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Sparkles,
    ArrowRight,
    Loader2
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import LogoutButton from "@/components/shared/logout-button"
import ExpenseList from "@/components/dashboard/expense-list"
import CategoryPieChart from "@/components/charts/category-pie-chart"
import MonthlyBarChart from "@/components/charts/monthly-bar-chart"
import PDFReport from "@/components/dashboard/pdf-report"
import FinancialHealth from "@/components/dashboard/financial-health"
import FadeIn from "@/components/shared/fade-in"
import AICopilotCard from "@/components/dashboard/ai-copilot-card"

import { useDashboard } from "@/components/providers/dashboard-provider"
import { getCategoryData, getMonthlyData } from "@/utils/analytics"
import { getLatestDailyBrief } from "@/app/actions/agents"

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { expenses, loading: dashboardLoading, loadExpenses } = useDashboard()
    const [brief, setBrief] = useState<any>(null)
    const [briefLoading, setBriefLoading] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            setBriefLoading(true)
            getLatestDailyBrief()
                .then(data => setBrief(data))
                .catch(err => console.error("Error loading brief:", err))
                .finally(() => setBriefLoading(false))
        }
    }, [user])

    if (authLoading || dashboardLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card px-10 py-6">
                    <p className="text-lg font-medium text-zinc-300">
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        )
    }

    if (!user) return null


    const totalIncome = expenses
        .filter((e) => e.type === "income")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    const totalExpenses = expenses
        .filter((e) => e.type === "expense")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    const savings = totalIncome - totalExpenses
    const categoryData = getCategoryData(expenses)
    const monthlyData = getMonthlyData(expenses)

    const stats = [
        {
            title: "Total Income",
            value: `$${totalIncome}`,
            icon: ArrowUpRight,
            color: "from-emerald-500/20 to-green-500/10",
            iconColor: "text-emerald-400",
        },
        {
            title: "Expenses",
            value: `$${totalExpenses}`,
            icon: ArrowDownRight,
            color: "from-red-500/20 to-orange-500/10",
            iconColor: "text-red-400",
        },
        {
            title: "Savings",
            value: `$${savings}`,
            icon: Wallet,
            color: "from-violet-500/20 to-cyan-500/10",
            iconColor: "text-violet-400",
        },
    ]

    return (
        <main className="min-h-screen px-6 lg:px-10 py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* HEADER */}
                <FadeIn>
                    <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-3">
                                <Sparkles size={14} />
                                AI Powered Finance Dashboard
                            </div>

                            <h1 className="text-3xl font-extrabold text-gradient">
                                Welcome Back
                            </h1>

                            <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                                Manage your finances intelligently with AI insights and smart analytics.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <PDFReport expenses={expenses} />
                            <LogoutButton />
                        </div>
                    </div>
                </FadeIn>

                {/* DAILY BRIEFING */}
                {briefLoading ? (
                    <FadeIn delay={0.02}>
                        <div className="glass-card p-6 border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin text-amber-400 w-5 h-5" />
                                <span className="text-zinc-400 text-sm">Consulting agents for your Daily Briefing...</span>
                            </div>
                        </div>
                    </FadeIn>
                ) : brief ? (
                    <FadeIn delay={0.02}>
                        <div className="glass-card p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                                        <Sparkles size={13} className="animate-pulse" />
                                        Latest Daily Financial Brief
                                    </h3>
                                    <p className="text-zinc-300 text-sm leading-relaxed max-w-4xl">{brief.summary}</p>
                                </div>
                                <Link 
                                    href="/dashboard/ai-agents" 
                                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all self-start md:self-center"
                                >
                                    Open Agent Workspace
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                ) : null}

                {/* AI COPILOT */}
                <FadeIn delay={0.05}>
                    <AICopilotCard />
                </FadeIn>

                {/* STATS */}
                <FadeIn delay={0.1}>
                    <div className="dashboard-grid">
                        {stats.map((card) => {
                            const Icon = card.icon

                            return (
                                <motion.div
                                    key={card.title}
                                    whileHover={{ y: -4 }}
                                    className={`glass-card glass-card-hover bg-gradient-to-br ${card.color} p-5 relative overflow-hidden`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {card.title}
                                            </p>
                                            <h2 className="text-2xl font-bold mt-2">
                                                {card.value}
                                            </h2>
                                        </div>

                                        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Icon
                                                className={card.iconColor}
                                                size={20}
                                            />
                                        </div>
                                    </div>

                                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                                </motion.div>
                            )
                        })}
                    </div>
                </FadeIn>

                {/* CHARTS STACKED VERTICALLY */}
                <div className="space-y-12">
                    {/* Category Pie Chart */}
                    <FadeIn delay={0.15}>
                        <div className="glass-card p-8">
                            <CategoryPieChart data={categoryData} />
                        </div>
                    </FadeIn>

                    {/* Monthly Spending Bar Chart */}
                    <FadeIn delay={0.18}>
                        <div className="glass-card p-8">
                            <MonthlyBarChart data={monthlyData} />
                        </div>
                    </FadeIn>
                </div>

                {/* TRANSACTIONS & HEALTH STACKED VERTICALLY */}
                <div className="space-y-12">
                    {/* Recent Transactions List */}
                    <FadeIn delay={0.2}>
                        <div className="glass-card p-8 flex flex-col justify-between">
                            <ExpenseList
                                expenses={expenses.slice(0, 5)}
                                refresh={loadExpenses}
                            />
                            <div className="flex justify-end mt-6 pt-4 border-t border-white/5">
                                <Link
                                    id="view-all-transactions-link"
                                    href="/dashboard/transactions"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold text-zinc-300 hover:text-white transition-all"
                                >
                                    Manage All Transactions
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Financial Health Scoring */}
                    <FadeIn delay={0.23}>
                        <div className="glass-card p-8">
                            <FinancialHealth expenses={expenses} />
                        </div>
                    </FadeIn>
                </div>
            </div>
        </main>
    )
}