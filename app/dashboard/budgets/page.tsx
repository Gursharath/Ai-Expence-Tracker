"use client"

import { Target, Sparkles } from "lucide-react"

import BudgetForm from "@/components/forms/budget-form"
import BudgetProgress from "@/components/dashboard/budget-progress"
import GoalPlanner from "@/components/dashboard/goal-planner"
import SubscriptionList from "@/components/dashboard/subscription-list"
import { useDashboard } from "@/components/providers/dashboard-provider"
import FadeIn from "@/components/shared/fade-in"

export default function BudgetsPage() {
    const { expenses, budgets, loadBudgets } = useDashboard()

    return (
        <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-6">
            {/* HEADER */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <Target className="text-violet-400" size={22} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-2">
                                <Sparkles size={12} />
                                Financial Budgeting & Savings Planning
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight">
                                Budgets & Goals
                            </h1>

                            <p className="text-zinc-400 mt-1.5 text-sm">
                                Set custom monthly category budgets, track progress, plan long-term savings goals, and manage recurring subscriptions.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* BUDGET & GOAL COMPONENTS STACKED VERTICALLY */}
            <div className="space-y-12">
                {/* Budget Setting Form */}
                <FadeIn delay={0.1}>
                    <div className="glass-card p-8">
                        <BudgetForm refresh={loadBudgets} />
                    </div>
                </FadeIn>

                {/* Budget Tracking Progress */}
                <FadeIn delay={0.15}>
                    <div className="glass-card p-8">
                        <BudgetProgress
                            budgets={budgets}
                            expenses={expenses}
                        />
                    </div>
                </FadeIn>

                {/* Detected Subscriptions List */}
                <FadeIn delay={0.2}>
                    <div className="glass-card p-8">
                        <SubscriptionList expenses={expenses} />
                    </div>
                </FadeIn>

                {/* Goal Planner Card (native container) */}
                <FadeIn delay={0.25}>
                    <GoalPlanner />
                </FadeIn>
            </div>
        </div>
    )
}
