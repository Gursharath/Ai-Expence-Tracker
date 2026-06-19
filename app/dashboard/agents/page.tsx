"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Clock, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Database, Calendar, RefreshCw } from "lucide-react"
import { getAgentLogs } from "@/app/actions/agents"
import FadeIn from "@/components/shared/fade-in"

interface AgentLogRecord {
    id: string
    created_at: string
    agent_name: string
    action: string
    result: any
    execution_time: number
}

export default function AgentLogsPage() {
    const [logs, setLogs] = useState<AgentLogRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    async function loadLogs() {
        try {
            setLoading(true)
            const data = await getAgentLogs()
            setLogs(data as AgentLogRecord[])
        } catch (error) {
            console.error("Failed to load agent execution logs:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [])

    const toggleExpand = (id: string) => {
        if (expandedLogId === id) {
            setExpandedLogId(null)
        } else {
            setExpandedLogId(id)
        }
    }

    // Filter logs
    const filteredLogs = logs.filter(log => 
        log.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Compute metrics
    const totalExecutions = logs.length
    const averageRuntime = totalExecutions > 0 
        ? Math.round(logs.reduce((sum, log) => sum + (log.execution_time || 0), 0) / totalExecutions)
        : 0

    // Since they logged successfully if they wrote to db, we check if the result shows success flag
    const successLogsCount = logs.filter(log => {
        const res = log.result
        return res && (res.success !== false)
    }).length
    
    const successRate = totalExecutions > 0 
        ? Math.round((successLogsCount / totalExecutions) * 100) 
        : 100

    return (
        <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-3">
                            <Database size={12} />
                            Platform Execution Logs
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Agent Operations & Diagnostics</h1>
                        <p className="text-sm text-zinc-400 mt-1">Audit detailed execution times, sub-agent routines, and LLM reasoning cycles.</p>
                    </div>

                    <button 
                        onClick={loadLogs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-xs transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh Logs
                    </button>
                </div>
            </FadeIn>

            {/* Metrics cards */}
            <FadeIn delay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl" />
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                            <Activity size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Executions</p>
                            <h3 className="text-2xl font-black text-white mt-1">{totalExecutions} runs</h3>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl" />
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                            <Clock size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Avg. Execution Time</p>
                            <h3 className="text-2xl font-black text-white mt-1">{averageRuntime} ms</h3>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Agent Success Rate</p>
                            <h3 className="text-2xl font-black text-white mt-1">{successRate}%</h3>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Logs Table Area */}
            <FadeIn delay={0.1}>
                <div className="glass-card overflow-hidden">
                    {/* Search and filter controls */}
                    <div className="p-5 border-b border-white/5 flex gap-4 bg-zinc-950/40">
                        <input
                            type="text"
                            placeholder="Filter by agent name or action..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/5 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Timeline List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500 text-sm">
                            <Clock className="w-8 h-8 text-violet-400 animate-spin" />
                            <span>Loading execution statistics...</span>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-24 text-zinc-500 text-sm">
                            <Database className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p>No agent logs matching your filter found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredLogs.map(log => {
                                const isSuccess = log.result?.success !== false
                                const isExpanded = expandedLogId === log.id
                                const timelineLogs = log.result?.timeline || log.result?.logs || []

                                return (
                                    <div key={log.id} className="transition-all hover:bg-white/[0.01]">
                                        {/* Summarized Log Row */}
                                        <div 
                                            onClick={() => toggleExpand(log.id)}
                                            className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {isSuccess ? (
                                                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                                ) : (
                                                    <ShieldAlert size={16} className="text-red-400 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">{log.agent_name}</span>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium">
                                                            {log.execution_time || 0}ms
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 truncate mt-1 max-w-lg md:max-w-2xl" title={log.action}>
                                                        Trigger: {log.action}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 text-xs text-zinc-500">
                                                <div className="hidden sm:flex items-center gap-1.5 font-medium">
                                                    <Calendar size={13} />
                                                    {new Date(log.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                                                </div>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {/* Expanded Detailed Log Block */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-zinc-950/70 border-t border-white/5 px-6 py-5 text-xs space-y-4"
                                                >
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {/* Details Column */}
                                                        <div>
                                                            <h4 className="font-semibold text-zinc-300 uppercase tracking-wider mb-2 text-[10px]">Execution Info</h4>
                                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2 text-zinc-400">
                                                                <p><strong className="text-white">Run ID:</strong> {log.id}</p>
                                                                <p><strong className="text-white">Timestamp:</strong> {new Date(log.created_at).toLocaleString()}</p>
                                                                <p><strong className="text-white">Invoked Agents:</strong> {log.result?.invokedAgents?.join(", ") || "None"}</p>
                                                                <p><strong className="text-white">Memories Activated:</strong> {log.result?.memoriesInjected?.length || 0} references</p>
                                                            </div>
                                                        </div>

                                                        {/* Full JSON Result Column */}
                                                        <div>
                                                            <h4 className="font-semibold text-zinc-300 uppercase tracking-wider mb-2 text-[10px]">Result Payload</h4>
                                                            <pre className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 overflow-x-auto text-[10px] text-cyan-300 font-mono max-h-40 max-w-full">
                                                                {JSON.stringify(log.result?.data || log.result || {}, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>

                                                    {/* Thinking Steps Timeline */}
                                                    {timelineLogs.length > 0 && (
                                                        <div className="pt-2">
                                                            <h4 className="font-semibold text-zinc-300 uppercase tracking-wider mb-3 text-[10px]">Sub-Agent Thinking Timeline</h4>
                                                            <div className="relative pl-4 border-l border-white/10 ml-2 space-y-4">
                                                                {timelineLogs.map((step: any, sIdx: number) => (
                                                                    <div key={sIdx} className="relative">
                                                                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-violet-500 border border-zinc-950 shadow-sm shadow-violet-500/50" />
                                                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-[11px]">
                                                                            <span className="font-bold text-white">{step.action}</span>
                                                                            <span className="text-[9px] text-zinc-500 font-mono">
                                                                                {new Date(step.timestamp).toLocaleTimeString(undefined, { hour12: false })}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-zinc-400 mt-0.5">{step.detail}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </FadeIn>
        </div>
    )
}
