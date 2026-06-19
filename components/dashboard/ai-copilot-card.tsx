"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { supabase } from "@/lib/supabase"
import { useDashboard } from "@/components/providers/dashboard-provider"
import {
    Bot,
    Send,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Target,
    Activity,
    RefreshCcw,
    CheckCircle2,
    ArrowRight,
    Brain
} from "lucide-react"



interface ChatMessage {
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export default function AICopilotCard() {
    const { copilotBriefing, copilotAnalysis, setCopilotData } = useDashboard()
    const [activeTab, setActiveTab] = useState<"briefing" | "metrics" | "chat">("briefing")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const briefing = copilotBriefing
    const analysis = copilotAnalysis

    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState("")
    const [chatLoading, setChatLoading] = useState(false)
    const chatBottomRef = useRef<HTMLDivElement>(null)

    // Load initial diagnostics briefing
    async function loadDiagnostics(force = false) {
        // If we already have cached diagnostics and are not forcing a refresh, load them instantly
        if (copilotBriefing && !force) {
            if (chatMessages.length === 0) {
                setChatMessages([
                    {
                        role: "assistant",
                        content: copilotBriefing,
                        timestamp: new Date()
                    }
                ])
            }
            return
        }

        try {
            setLoading(true)
            setError(null)
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch("/api/agents/copilot", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    message: "Give me an initial comprehensive diagnostic of my current spending, budgets, and savings goals status. Identify any critical issues."
                })
            })

            if (!response.ok) {
                throw new Error("Failed to contact the financial copilot. Please check your configuration.")
            }

            const data = await response.json()
            setCopilotData(data.answer, data.analysis)

            // Seed initial chat messages
            setChatMessages([
                {
                    role: "assistant",
                    content: data.answer,
                    timestamp: new Date()
                }
            ])
        } catch (err: unknown) {
            const errorObj = err as Error
            console.error(errorObj)
            setError(errorObj.message || "An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDiagnostics(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [copilotBriefing])

    useEffect(() => {
        if (activeTab === "chat") {
            chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [chatMessages, activeTab])

    async function handleSendChatMessage() {
        if (!chatInput.trim() || chatLoading) return

        const userMsgText = chatInput.trim()
        setChatInput("")

        const newMessages = [
            ...chatMessages,
            { role: "user" as const, content: userMsgText, timestamp: new Date() }
        ]
        setChatMessages(newMessages)
        setChatLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch("/api/agents/copilot", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: userMsgText })
            })

            if (!response.ok) {
                throw new Error("Failed to send message.")
            }

            const data = await response.json()
            setChatMessages(prev => [
                ...prev,
                { role: "assistant" as const, content: data.answer, timestamp: new Date() }
            ])
            if (data.analysis) {
                setCopilotData(copilotBriefing, data.analysis)
            }
        } catch (err: unknown) {
            const errorObj = err as Error
            console.error(errorObj)
            setChatMessages(prev => [
                ...prev,
                { role: "assistant" as const, content: "⚠️ Sorry, I encountered an error communicating with my system. Please try again.", timestamp: new Date() }
            ])
        } finally {
            setChatLoading(false)
        }
    }

    // Aggregates alerts across all agents
    const allAlerts: Array<{ type: "danger" | "warning" | "info"; text: string }> = []
    if (analysis) {
        if (analysis.spending?.alerts) {
            analysis.spending.alerts.forEach((a: string) => allAlerts.push({ type: "warning", text: a }))
        }
        if (analysis.budget?.overrunRisks) {
            analysis.budget.overrunRisks.forEach((r: any) => {
                allAlerts.push({
                    type: "danger",
                    text: `Overrun Risk: ${r.category} budget limit is $${r.limit}, projected spend is $${r.projectedSpend} ($${r.projectedOverrun} over limit).`
                })
            })
        }
        if (analysis.goals && analysis.goals.savingsDeficit > 0) {
            allAlerts.push({
                type: "warning",
                text: `Savings Deficit: You need to save $${analysis.goals.savingsDeficit} more per month to stay on track for your active saving goals.`
            })
        }
    }

    return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 lg:p-8">
            {/* Top accent glow */}
            <div className="absolute -top-24 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-[1px]">
                        <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center">
                            <Brain className="text-violet-400 w-6 h-6 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-white">Agentic AI Financial Copilot</h2>
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full uppercase tracking-wider">Active Copilot</span>
                        </div>
                        <p className="text-sm text-zinc-400">Coordinated financial agents offering real-time guidance</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Navigation Tabs */}
                    <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
                        <button
                            id="copilot-tab-briefing"
                            onClick={() => setActiveTab("briefing")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "briefing" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                        >
                            Daily Briefing
                        </button>
                        <button
                            id="copilot-tab-metrics"
                            onClick={() => setActiveTab("metrics")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "metrics" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                        >
                            Agent Diagnostics
                        </button>
                        <button
                            id="copilot-tab-chat"
                            onClick={() => setActiveTab("chat")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "chat" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                        >
                            Copilot Chat
                        </button>
                    </div>

                    <button
                        id="copilot-refresh-btn"
                        onClick={() => loadDiagnostics(true)}
                        disabled={loading}
                        className="group flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
                        title="Re-run Diagnostic Agents"
                    >
                        <RefreshCcw size={15} className={`transition-transform duration-500 group-hover:rotate-180 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="relative z-10 p-4 mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-sm">
                    <AlertTriangle className="shrink-0 w-5 h-5 mt-0.5" />
                    <div>
                        <p className="font-semibold">Diagnostic Run Failed</p>
                        <p className="text-red-400/90">{error}</p>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="relative z-10 min-h-[320px]">
                {loading && !analysis ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-12">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-violet-500 animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-zinc-300">Summoning Financial Sub-Agents...</p>
                            <p className="text-xs text-zinc-500 mt-1">Analyzing spending patterns, goals feasibility, and budget limits</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {/* Tab 1: Briefing */}
                        {activeTab === "briefing" && (
                            <motion.div
                                key="briefing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Metric Cards Row */}
                                {analysis && (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Current Spending</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-xl font-bold text-white">${analysis.spending?.monthlySpend ?? 0}</span>
                                                {analysis.spending && (
                                                    <span className={`inline-flex items-center text-xs font-semibold ${analysis.spending.changePercentage > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                                        {analysis.spending.changePercentage > 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                                                        {Math.abs(analysis.spending.changePercentage)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Budget Utilization</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-xl font-bold text-white">{analysis.budget?.utilizationPercentage ?? 0}%</span>
                                                <span className="text-[10px] text-zinc-500">of ${analysis.budget?.totalBudgetLimit ?? 0} limit</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full bg-gradient-to-r ${analysis.budget && analysis.budget.utilizationPercentage > 90 ? "from-red-500 to-orange-500" : "from-violet-500 to-cyan-500"}`} 
                                                    style={{ width: `${Math.min(analysis.budget?.utilizationPercentage ?? 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Goals Feasibility</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-xl font-bold text-white">{analysis.goals?.feasibilityScore ?? 0}/100</span>
                                                <span className="text-xs text-cyan-400 font-semibold">Score</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" 
                                                    style={{ width: `${analysis.goals?.feasibilityScore ?? 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Subscriptions</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-xl font-bold text-white">{analysis.spending?.subscriptions?.length ?? 0}</span>
                                                <span className="text-xs text-zinc-500">detected</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Briefing Summary Box */}
                                <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.01]">
                                    <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                                        <Bot size={16} className="text-violet-400" />
                                        Copilot Assessment
                                    </h3>
                                    <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-md font-semibold mt-4 mb-2 text-cyan-300">{children}</h2>,
                                                p: ({ children }) => <p className="mb-3 leading-relaxed text-zinc-300">{children}</p>,
                                                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-3">{children}</ul>,
                                                li: ({ children }) => <li className="text-zinc-300 text-sm leading-relaxed">{children}</li>,
                                            }}
                                        >
                                            {briefing}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {/* Active Risk Alerts */}
                                {allAlerts.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                            <AlertTriangle size={14} /> Active Risk Alerts
                                        </h4>
                                        <div className="grid gap-2">
                                            {allAlerts.map((alert, index) => (
                                                <div 
                                                    key={index}
                                                    className={`p-3.5 rounded-xl text-xs flex gap-3 items-start ${
                                                        alert.type === "danger" 
                                                            ? "bg-red-500/10 border border-red-500/20 text-red-300" 
                                                            : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                                                    }`}
                                                >
                                                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                                    <span>{alert.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Tab 2: Metrics Diagnostics details */}
                        {activeTab === "metrics" && (
                            <motion.div
                                key="metrics"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {analysis ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Budgets Progress and overrun risks */}
                                        {analysis.budget && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                                    <Activity size={16} className="text-cyan-400" />
                                                    Budget Limits & Safety
                                                </h4>
                                                
                                                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                                                    {analysis.budget.categoryBudgets?.length === 0 ? (
                                                        <p className="text-xs text-zinc-500">No active category budgets defined.</p>
                                                    ) : (
                                                        analysis.budget.categoryBudgets.slice(0, 4).map((b: any, idx: number) => (
                                                            <div key={idx} className="space-y-1.5">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="font-medium text-zinc-300">{b.category}</span>
                                                                    <span className="text-zinc-400">${b.spent} spent / <span className="text-zinc-500">${b.limit}</span></span>
                                                                </div>
                                                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full rounded-full bg-gradient-to-r ${b.utilizationPercentage > 100 ? "from-red-500 to-orange-500" : b.utilizationPercentage > 85 ? "from-amber-500 to-yellow-400" : "from-cyan-500 to-violet-500"}`}
                                                                        style={{ width: `${Math.min(b.utilizationPercentage, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Reallocation Suggestions */}
                                                {analysis.budget.reallocations && analysis.budget.reallocations.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Reallocation Engine</h5>
                                                        <div className="space-y-2">
                                                            {analysis.budget.reallocations.map((re: any, idx: number) => (
                                                                <div key={idx} className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/10 text-xs">
                                                                    <div className="flex items-center justify-between font-semibold text-white mb-1">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span>{re.fromCategory}</span>
                                                                            <ArrowRight size={12} className="text-violet-400" />
                                                                            <span>{re.toCategory}</span>
                                                                        </div>
                                                                        <span className="text-emerald-400">+${re.amount}</span>
                                                                    </div>
                                                                    <p className="text-zinc-400 text-[11px] leading-relaxed">{re.reason}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Goals Tracking */}
                                        {analysis.goals && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                                    <Target size={16} className="text-violet-400" />
                                                    Active Savings Goals
                                                </h4>

                                                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                                                    {analysis.goals.goals?.length === 0 ? (
                                                        <p className="text-xs text-zinc-500">No active goals configured.</p>
                                                    ) : (
                                                        analysis.goals.goals.slice(0, 3).map((g: any, idx: number) => (
                                                            <div key={idx} className="space-y-2">
                                                                <div className="flex justify-between text-xs">
                                                                    <div>
                                                                        <p className="font-semibold text-zinc-300">{g.title}</p>
                                                                        <p className="text-[10px] text-zinc-500">Target: {new Date(g.targetDate).toLocaleDateString(undefined, {month: "short", year: "numeric"})}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-zinc-300 font-medium">${g.currentAmount} saved / <span className="text-zinc-500">${g.targetAmount}</span></p>
                                                                        <p className="text-[10px] text-violet-400 font-medium">${g.requiredMonthlySavings}/mo required</p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                                                        style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Goal planning recommendations */}
                                                {analysis.goals.recommendations && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Savings Strategies</h5>
                                                        <ul className="space-y-2">
                                                            {analysis.goals.recommendations.map((rec: any, idx: number) => (
                                                                <li key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 flex items-start gap-2.5">
                                                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                                                    <span>{rec}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-sm text-center py-12">No metrics data loaded. Please trigger a fresh diagnostic.</p>
                                )}
                            </motion.div>
                        )}

                        {/* Tab 3: Conversational Copilot Chat */}
                        {activeTab === "chat" && (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col h-[480px] rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden"
                            >
                                {/* Chat Messages Log */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {chatMessages.map((msg, index) => (
                                        <div 
                                            key={index}
                                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            {msg.role === "assistant" && (
                                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                    <Brain size={14} className="text-violet-400" />
                                                </div>
                                            )}

                                            <div 
                                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                                    msg.role === "user" 
                                                        ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/10 font-medium" 
                                                        : "bg-white/[0.03] border border-white/5 text-zinc-200"
                                                }`}
                                            >
                                                {msg.role === "assistant" ? (
                                                    <div className="prose prose-invert max-w-none text-zinc-300 text-xs leading-relaxed space-y-2">
                                                        <ReactMarkdown
                                                            components={{
                                                                h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-1">{children}</h1>,
                                                                h2: ({ children }) => <h2 className="text-xs font-semibold text-cyan-300 mt-2 mb-1">{children}</h2>,
                                                                p: ({ children }) => <p className="mb-2 leading-relaxed text-zinc-300">{children}</p>,
                                                                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                                                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                                                                li: ({ children }) => <li className="text-zinc-300 leading-relaxed">{children}</li>,
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <span>{msg.content}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {chatLoading && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                <Brain size={14} className="text-violet-400 animate-pulse" />
                                            </div>
                                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-xs flex gap-1.5 items-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatBottomRef} />
                                </div>

                                {/* Chat Input Box */}
                                <div className="p-3 border-t border-white/5 bg-zinc-950/40 flex gap-2">
                                    <input
                                        id="copilot-chat-input"
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleSendChatMessage()
                                        }}
                                        placeholder="Ask Copilot about overspending, saving tips, or budgeting..."
                                        disabled={chatLoading}
                                        className="flex-1 bg-white/5 border border-white/5 focus:border-violet-500 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                                    />
                                    <button
                                        id="copilot-chat-send-btn"
                                        onClick={handleSendChatMessage}
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-55 disabled:pointer-events-none"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
