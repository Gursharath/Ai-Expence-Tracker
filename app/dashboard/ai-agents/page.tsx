"use client"

import React, { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { 
    Brain, Send, Trash2, Cpu, AlertTriangle, 
    CheckCircle2, Clock, RefreshCw, Plus, FileText
} from "lucide-react"

// Import Server Actions
import { 
    runOrchestrator, getMemories, deleteMemoryAction, 
    saveMemoryAction, getLatestDailyBrief, generateDailyBriefAction 
} from "@/app/actions/agents"
import FadeIn from "@/components/shared/fade-in"

// Define interfaces
interface ChatMessage {
    role: "user" | "assistant"
    content: string
    timestamp: Date
    timeline?: Array<{ action: string; detail: string; timestamp: string }>
    activeAgents?: string[]
}

interface AgentCardInfo {
    id: string
    name: string
    description: string
    status: "idle" | "running" | "completed"
}

export default function AIAgentsPage() {
    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const [chatLoading, setChatLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Current execution timeline (real-time thinking simulation)
    const [thinkingSteps, setThinkingSteps] = useState<Array<{ action: string; detail: string }>>([])

    // Memory system state
    const [memories, setMemories] = useState<any[]>([])
    const [memLoading, setMemLoading] = useState(false)
    const [newMemText, setNewMemText] = useState("")
    const [newMemType, setNewMemType] = useState("preference")

    // Daily brief state
    const [brief, setBrief] = useState<any>(null)
    const [briefLoading, setBriefLoading] = useState(false)

    // Sub-agent statuses
    const [agents, setAgents] = useState<AgentCardInfo[]>([
        { id: "spending", name: "Spending Analyst", description: "Analyzes trends & flags anomalies", status: "idle" },
        { id: "budget", name: "Budget Agent", description: "Monitors category limits & forecasts breaches", status: "idle" },
        { id: "savings", name: "Savings Agent", description: "Tracks goals & savings contributions", status: "idle" },
        { id: "subscription", name: "Subscription Agent", description: "Identifies recurring costs", status: "idle" },
        { id: "forecast", name: "Forecast Agent", description: "Predicts cash flow & category spending", status: "idle" },
        { id: "coach", name: "Financial Coach", description: "Formulates step-by-step action plans", status: "idle" },
    ])

    // Load initial data
    useEffect(() => {
        async function init() {
            setMemLoading(true)
            setBriefLoading(true)
            try {
                // Fetch memories
                const mems = await getMemories()
                setMemories(mems)

                // Fetch daily brief
                const latestBrief = await getLatestDailyBrief()
                setBrief(latestBrief)
            } catch (err) {
                console.error("Initialization error:", err)
            } finally {
                setMemLoading(false)
                setBriefLoading(false)
            }

            // Seed initial greeting
            setMessages([
                {
                    role: "assistant",
                    content: "Hello! I am your coordinated AI Financial Copilot. I can query our specialized analysts, inspect your goals and category limits, and check subscription drains to help optimize your cash flow. What financial questions can I answer for you today?",
                    timestamp: new Date()
                }
            ])
        }

        init()
    }, [])

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, thinkingSteps])

    // Handle sending a chat message
    async function handleSendMessage() {
        if (!input.trim() || chatLoading) return
        const userMsg = input.trim()
        setInput("")

        // Add user message
        setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }])
        setChatLoading(true)
        setThinkingSteps([])

        // Animate sub-agent diagnostic sequences
        const setAgentStatus = (id: string, status: "idle" | "running" | "completed") => {
            setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a))
        }

        try {
            // Simulated local diagnostic steps for responsiveness
            setThinkingSteps(prev => [...prev, { action: "Orchestrator Triggered", detail: `Routing query "${userMsg}"` }])
            await new Promise(r => setTimeout(r, 600))
            
            setThinkingSteps(prev => [...prev, { action: "Memory Search", detail: "Scanning long-term persistent user facts..." }])
            await new Promise(r => setTimeout(r, 600))

            setThinkingSteps(prev => [...prev, { action: "Sub-agent Invocation", detail: "Spawning specialized budget and analyst routines in parallel..." }])
            
            // Run server action
            const res = await runOrchestrator(userMsg)

            // Parse result
            if (res.activeAgents) {
                res.activeAgents.forEach((agentName: string) => {
                    const matchedId = agents.find(a => a.name === agentName)?.id
                    if (matchedId) setAgentStatus(matchedId, "completed")
                })
            }

            setMessages(prev => [
                ...prev, 
                { 
                    role: "assistant", 
                    content: res.answer, 
                    timestamp: new Date(),
                    timeline: res.timeline,
                    activeAgents: res.activeAgents
                }
            ])

            // Re-fetch memories in case any new fact was saved
            const updatedMems = await getMemories()
            setMemories(updatedMems)

        } catch (error) {
            console.error("Orchestrator error:", error)
            setMessages(prev => [
                ...prev, 
                { 
                    role: "assistant", 
                    content: "⚠️ I encountered an error while coordinating my sub-agents. Please check your connection and try again.", 
                    timestamp: new Date() 
                }
            ])
        } finally {
            setChatLoading(false)
            setThinkingSteps([])
            // Reset agent statuses to idle
            setAgents(prev => prev.map(a => ({ ...a, status: "idle" })))
        }
    }

    // Save memory manually
    async function handleAddMemory() {
        if (!newMemText.trim() || memLoading) return
        try {
            setMemLoading(true)
            await saveMemoryAction(newMemText.trim(), newMemType, 3)
            setNewMemText("")
            const list = await getMemories()
            setMemories(list)
        } catch (error) {
            console.error("Save memory error:", error)
        } finally {
            setMemLoading(false)
        }
    }

    // Delete memory
    async function handleDeleteMemory(id: string) {
        try {
            setMemLoading(true)
            await deleteMemoryAction(id)
            const list = await getMemories()
            setMemories(list)
        } catch (error) {
            console.error("Delete memory error:", error)
        } finally {
            setMemLoading(false)
        }
    }

    // Generate brief
    async function handleRegenerateBrief() {
        try {
            setBriefLoading(true)
            const newBrief = await generateDailyBriefAction()
            setBrief(newBrief)
        } catch (error) {
            console.error("Failed to generate briefing:", error)
        } finally {
            setBriefLoading(false)
        }
    }

    return (
        <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-[1px] shrink-0">
                            <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center">
                                <Brain className="text-violet-400 w-6 h-6 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                Financial Copilot Workspace
                                <span className="text-[10px] bg-cyan-400/10 border border-cyan-400/25 text-cyan-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Multi-Agent</span>
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">Chat with coordinated sub-agents, govern long-term memory records, and read autonomous briefings.</p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Panel: Active Agents & Memory Control (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Active Agents Card */}
                    <div className="glass-card p-5 relative overflow-hidden">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Cpu size={16} className="text-violet-400" />
                            Specialized Sub-Agents
                        </h3>

                        <div className="grid gap-3">
                            {agents.map(a => (
                                <div key={a.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                                    <div>
                                        <h4 className="text-xs font-bold text-white">{a.name}</h4>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">{a.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {a.status === "running" && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                            </span>
                                        )}
                                        <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                            a.status === "running" 
                                                ? "bg-violet-400/15 text-violet-400" 
                                                : a.status === "completed"
                                                    ? "bg-emerald-400/15 text-emerald-400"
                                                    : "bg-zinc-800 text-zinc-500"
                                        }`}>
                                            {a.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Memory Control Panel */}
                    <div className="glass-card p-5 relative overflow-hidden">
                        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                            <Brain size={16} className="text-cyan-400" />
                            AI Memory System
                        </h3>
                        <p className="text-[10px] text-zinc-500 mb-4">Governs long-term financial parameters captured from conversations.</p>

                        {/* List memories */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {memLoading && memories.length === 0 ? (
                                <div className="text-center py-6 text-zinc-500 text-xs">
                                    <Clock size={16} className="animate-spin mx-auto mb-2 text-zinc-500" />
                                    <span>Syncing memory cells...</span>
                                </div>
                            ) : memories.length === 0 ? (
                                <div className="text-center py-6 text-zinc-600 text-[11px] bg-white/[0.01] border border-dashed border-white/5 rounded-xl">
                                    No memories captured yet. Chat to save automatically!
                                </div>
                            ) : (
                                memories.map(m => (
                                    <div key={m.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between gap-3 text-[11px]">
                                        <div className="min-w-0">
                                            <span className="font-semibold text-cyan-400 uppercase text-[9px] block tracking-wider">{m.memory_type}</span>
                                            <p className="text-zinc-300 mt-0.5 leading-relaxed truncate max-w-[200px]" title={m.memory}>{m.memory}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteMemory(m.id)}
                                            className="text-red-400 hover:text-red-300 shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 transition-all self-center"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add memory form */}
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                            <div className="flex gap-2">
                                <select 
                                    value={newMemType}
                                    onChange={e => setNewMemType(e.target.value)}
                                    className="bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-zinc-400 focus:outline-none"
                                >
                                    <option value="preference">Preference</option>
                                    <option value="goal">Goal</option>
                                    <option value="income">Income</option>
                                    <option value="spending_habit">Habit</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Add manual preference..."
                                    value={newMemText}
                                    onChange={e => setNewMemText(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/5 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none placeholder-zinc-500"
                                />
                                <button 
                                    onClick={handleAddMemory}
                                    disabled={!newMemText.trim()}
                                    className="bg-cyan-500 text-white rounded-lg p-1.5 hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Main AI Copilot Chat (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card flex flex-col h-[580px] overflow-hidden relative">
                        {/* Glowing accent border */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-violet-600/50 via-cyan-400/50 to-transparent" />

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {m.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                            <Brain size={14} className="text-violet-400" />
                                        </div>
                                    )}

                                    <div className="max-w-[85%] space-y-2">
                                        <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                            m.role === "user" 
                                                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium shadow-md shadow-violet-600/10" 
                                                : "bg-white/[0.03] border border-white/5 text-zinc-200"
                                        }`}>
                                            {m.role === "assistant" ? (
                                                <div className="prose prose-invert max-w-none text-zinc-300 text-xs space-y-2">
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-1.5 border-b border-white/5 pb-1">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-xs font-semibold text-cyan-300 mt-3 mb-1">{children}</h2>,
                                                            p: ({ children }) => <p className="mb-2 leading-relaxed text-zinc-300">{children}</p>,
                                                            strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                                                            li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span>{m.content}</span>
                                            )}
                                        </div>

                                        {/* Sub-agents involved bubble */}
                                        {m.activeAgents && m.activeAgents.length > 0 && (
                                            <div className="flex flex-wrap gap-1 items-center pl-1 text-[9px] text-zinc-500 font-semibold uppercase">
                                                <Cpu size={10} className="text-zinc-500 mr-0.5" />
                                                Involved: 
                                                {m.activeAgents.map((ag, aIdx) => (
                                                    <span key={aIdx} className="bg-white/5 border border-white/5 rounded-full px-2 py-0.5 text-zinc-400">
                                                        {ag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Thinking/Simulation Steps */}
                            {chatLoading && (
                                <div className="space-y-4">
                                    {thinkingSteps.map((step, sIdx) => (
                                        <div key={sIdx} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                <Brain size={14} className="text-violet-400 animate-pulse" />
                                            </div>
                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-400 flex items-center gap-3">
                                                <Clock size={12} className="text-cyan-400 animate-spin" />
                                                <div>
                                                    <p className="font-bold text-white text-[11px]">{step.action}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{step.detail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* General Loader */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                            <Brain size={14} className="text-violet-400 animate-bounce" />
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-xs flex gap-1.5 items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-70" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="p-3 border-t border-white/5 bg-zinc-950/40 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                                placeholder="Ask about budgets, goals, forecasts, or subscriptions..."
                                disabled={chatLoading}
                                className="flex-1 bg-white/5 border border-white/5 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={chatLoading || !input.trim()}
                                className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl px-4 py-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-55 disabled:pointer-events-none"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Daily Financial Brief Panel (3 cols) */}
                <div className="lg:col-span-3">
                    <div className="glass-card p-5 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center gap-2 mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <FileText size={16} className="text-amber-400" />
                                    Daily Financial Brief
                                </h3>
                                <button 
                                    onClick={handleRegenerateBrief}
                                    disabled={briefLoading}
                                    className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 transition-all text-zinc-400 hover:text-white"
                                    title="Regenerate brief"
                                >
                                    <RefreshCw size={13} className={briefLoading ? "animate-spin" : ""} />
                                </button>
                            </div>

                            {briefLoading ? (
                                <div className="text-center py-16 text-zinc-500 text-xs">
                                    <Clock size={20} className="animate-spin mx-auto mb-2 text-violet-400" />
                                    <span>Running agents for briefing...</span>
                                </div>
                            ) : !brief ? (
                                <div className="text-center py-16 text-zinc-500 text-xs">
                                    <AlertTriangle size={20} className="mx-auto mb-2 text-amber-500" />
                                    <p>No briefs generated yet.</p>
                                    <button 
                                        onClick={handleRegenerateBrief}
                                        className="mt-3 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-white text-[10px]"
                                    >
                                        Run Briefing Agent
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 pr-1 text-xs max-h-[460px] overflow-y-auto">
                                    {/* Brief summary */}
                                    <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-violet-300">Executive Summary</span>
                                        <p className="text-zinc-300 mt-1 leading-relaxed text-[11px]">{brief.summary}</p>
                                    </div>

                                    {/* Spending Summary */}
                                    <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Spending Overview</span>
                                        <p className="text-zinc-300 mt-1 leading-relaxed text-[11px]">{brief.spendingSummary}</p>
                                    </div>

                                    {/* Budget status */}
                                    <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Budgets & safety</span>
                                        <p className="text-zinc-300 mt-1 leading-relaxed text-[11px]">{brief.budgetStatus}</p>
                                    </div>

                                    {/* Savings progress */}
                                    <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Goals & Feasibility</span>
                                        <p className="text-zinc-300 mt-1 leading-relaxed text-[11px]">{brief.savingsProgress}</p>
                                    </div>

                                    {/* Forecast */}
                                    <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Predictions Model</span>
                                        <p className="text-zinc-300 mt-1 leading-relaxed text-[11px]">{brief.forecastDetails}</p>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="space-y-1.5">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Coach Directives</span>
                                        {brief.recommendations?.map((rec: string, idx: number) => (
                                            <div key={idx} className="flex gap-2 items-start text-zinc-300 bg-white/[0.01] border border-white/5 p-2 rounded-lg leading-relaxed">
                                                <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                                                <span>{rec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
