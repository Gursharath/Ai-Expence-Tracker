"use client"

import { LineChart, Sparkles } from "lucide-react"

import WeeklyTrendsChart from "@/components/charts/weekly-trends-chart"
import SavingsGrowthChart from "@/components/charts/savings-growth-chart"
import ExpenseCalendar from "@/components/dashboard/expense-calendar"
import MonthlyReport from "@/components/dashboard/monthly-report"
import { useDashboard } from "@/components/providers/dashboard-provider"
import { useAuth } from "@/components/providers/auth-provider"
import FadeIn from "@/components/shared/fade-in"
import { getWeeklyTrendData, getSavingsGrowthData } from "@/utils/advanced-analytics"

export default function AnalyticsPage() {
    const { user } = useAuth()
    const { expenses } = useDashboard()

    if (!user) return null

    const weeklyTrendData = getWeeklyTrendData(expenses)
    const savingsGrowthData = getSavingsGrowthData(expenses)

    return (
        <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-6">
            {/* HEADER */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <LineChart className="text-violet-400" size={22} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-2">
                                <Sparkles size={12} />
                                Advanced Financial Analytics
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight">
                                Analytics & Trends
                            </h1>

                            <p className="text-zinc-400 mt-1.5 text-sm">
                                Deep dive into your financial habits with weekly spending curves, long-term savings indicators, and smart calendar events.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* ANALYTICS COMPONENTS STACKED VERTICALLY */}
            <div className="space-y-12">
                {/* Weekly Spending Trends Chart */}
                <FadeIn delay={0.1}>
                    <WeeklyTrendsChart data={weeklyTrendData} />
                </FadeIn>

                {/* Savings Growth over Time Chart */}
                <FadeIn delay={0.15}>
                    <SavingsGrowthChart data={savingsGrowthData} />
                </FadeIn>

                {/* Expense Events Calendar */}
                <FadeIn delay={0.2}>
                    <ExpenseCalendar expenses={expenses} />
                </FadeIn>

                {/* Monthly Email Report Builder */}
                <FadeIn delay={0.25}>
                    <MonthlyReport
                        expenses={expenses}
                        email={user.email || ""}
                    />
                </FadeIn>
            </div>
        </div>
    )
}
