"use client"

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts"

import {
    TrendingUp,
} from "lucide-react"

export default function SavingsGrowthChart({
    data,
}: {
    data: any[]
}) {
    return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent p-8 backdrop-blur-2xl">
            {/* Glow Effects */}

            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[140px]" />

            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 blur-[120px]" />

            {/* Header */}

            <div className="relative z-10 flex items-start justify-between mb-10">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="text-emerald-400" />
                    </div>

                    <div>
                        <p className="text-emerald-300 text-sm font-semibold uppercase tracking-[0.25em]">
                            Savings Analytics
                        </p>

                        <h2 className="text-4xl font-black mt-3 tracking-tight">
                            Savings Growth Curve
                        </h2>

                        <p className="text-zinc-400 mt-3 text-lg leading-8 max-w-2xl">
                            Track your long-term financial growth and monitor how your savings evolve over time.
                        </p>
                    </div>
                </div>

                {/* Growth Badge */}

                <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />

                    <span className="text-emerald-300 font-medium">
                        Positive Growth
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
                                id="savingsGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#22c55e"
                                    stopOpacity={0.55}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#22c55e"
                                    stopOpacity={0}
                                />
                            </linearGradient>

                            <filter id="glow">
                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="8"
                                    floodColor="#22c55e"
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
                            dataKey="date"
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
                                    "#22c55e",
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
                            dataKey="savings"
                            stroke="transparent"
                            fill="url(#savingsGradient)"
                            animationDuration={
                                1800
                            }
                        />

                        {/* Main Line */}

                        <Line
                            type="monotone"
                            dataKey="savings"
                            stroke="#22c55e"
                            strokeWidth={5}
                            dot={false}
                            filter="url(#glow)"
                            animationDuration={
                                2200
                            }
                            activeDot={{
                                r: 8,
                                fill: "#22c55e",
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
                        Savings Trend
                    </p>

                    <h3 className="text-2xl font-bold mt-2 text-emerald-400">
                        Growing
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-zinc-400 text-sm">
                        Financial Momentum
                    </p>

                    <h3 className="text-2xl font-bold mt-2 text-cyan-400">
                        Stable
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-zinc-400 text-sm">
                        AI Prediction
                    </p>

                    <h3 className="text-2xl font-bold mt-2 text-violet-400">
                        Positive
                    </h3>
                </div>
            </div>
        </div>
    )
}