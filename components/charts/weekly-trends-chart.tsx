"use client"

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"

import {
    Activity,
    TrendingUp,
} from "lucide-react"

export default function WeeklyTrendsChart({
    data,
}: {
    data: any[]
}) {
    return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent p-8 backdrop-blur-2xl">
            {/* Glow Effects */}

            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[140px]" />

            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 blur-[120px]" />

            {/* Header */}

            <div className="relative z-10 flex items-start justify-between mb-10">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                        <Activity className="text-blue-400" />
                    </div>

                    <div>
                        <p className="text-blue-300 text-sm font-semibold uppercase tracking-[0.25em]">
                            Weekly Analytics
                        </p>

                        <h2 className="text-4xl font-black mt-3 tracking-tight">
                            Spending Trends
                        </h2>

                        <p className="text-zinc-400 mt-3 text-lg leading-8 max-w-2xl">
                            Analyze your weekly spending behavior and identify financial patterns with AI-powered insights.
                        </p>
                    </div>
                </div>

                {/* Status Badge */}

                <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <TrendingUp
                        size={18}
                        className="text-blue-400"
                    />

                    <span className="text-blue-300 font-medium">
                        Live Analytics
                    </span>
                </div>
            </div>

            {/* Chart */}

            <div className="relative z-10 h-[420px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart data={data}>
                        {/* Gradients */}

                        <defs>
                            <linearGradient
                                id="spendingGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.6}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                />
                            </linearGradient>

                            {/* Glow */}

                            <filter id="blueGlow">
                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="8"
                                    floodColor="#3b82f6"
                                    floodOpacity="0.7"
                                />
                            </filter>
                        </defs>

                        {/* Grid */}

                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />

                        {/* Axis */}

                        <XAxis
                            dataKey="week"
                            stroke="#a1a1aa"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            stroke="#a1a1aa"
                            tickLine={false}
                            axisLine={false}
                        />

                        {/* Tooltip */}

                        <Tooltip
                            cursor={{
                                stroke:
                                    "#3b82f6",
                                strokeWidth: 1,
                                strokeDasharray:
                                    "4 4",
                            }}
                            contentStyle={{
                                background:
                                    "rgba(15,23,42,0.95)",

                                border:
                                    "1px solid rgba(255,255,255,0.08)",

                                borderRadius:
                                    "20px",

                                backdropFilter:
                                    "blur(20px)",

                                color: "white",

                                boxShadow:
                                    "0 10px 40px rgba(0,0,0,0.35)",
                            }}
                        />

                        {/* Area */}

                        <Area
                            type="monotone"
                            dataKey="spending"
                            stroke="#3b82f6"
                            strokeWidth={5}
                            fill="url(#spendingGradient)"
                            fillOpacity={1}
                            filter="url(#blueGlow)"
                            animationDuration={
                                2200
                            }
                            activeDot={{
                                r: 8,
                                fill: "#3b82f6",
                                stroke:
                                    "white",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Stats */}

            <div className="relative z-10 mt-10 grid md:grid-cols-3 gap-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-zinc-400 text-sm">
                        Spending Pattern
                    </p>

                    <h3 className="text-2xl font-bold mt-2 text-blue-400">
                        Dynamic
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-zinc-400 text-sm">
                        Weekly Activity
                    </p>

                    <h3 className="text-2xl font-bold mt-2 text-cyan-400">
                        High
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-zinc-400 text-sm">
                        AI Observation
                    </p>

                    <h3 className="text-2xl font-bold mt-2 text-violet-400">
                        Stable Trend
                    </h3>
                </div>
            </div>
        </div>
    )
}