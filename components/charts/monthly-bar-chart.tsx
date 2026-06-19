"use client"

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from "recharts"

const BAR_COLORS = [
    "#8b5cf6",
    "#06b6d4",
    "#22c55e",
    "#f97316",
]

export default function MonthlyBarChart({
    data,
}: {
    data: {
        month: string
        income: number
        expense: number
    }[]
}) {
    return (
        <div className="relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 blur-[120px]" />

            <div className="relative z-10 mb-8">
                <h2 className="text-3xl font-bold">
                    Monthly Analytics
                </h2>

                <p className="text-zinc-400 mt-2">
                    AI-powered monthly financial trends
                </p>
            </div>

            <div className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <ResponsiveContainer
                    width="100%"
                    height={400}
                >
                    <BarChart
                        data={data}
                        barGap={10}
                    >
                        <defs>
                            <linearGradient
                                id="incomeGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#22c55e"
                                    stopOpacity={1}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#15803d"
                                    stopOpacity={0.7}
                                />
                            </linearGradient>

                            <linearGradient
                                id="expenseGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#ef4444"
                                    stopOpacity={1}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#7f1d1d"
                                    stopOpacity={0.7}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="month"
                            stroke="#a1a1aa"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            stroke="#a1a1aa"
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip
                            cursor={{
                                fill:
                                    "rgba(255,255,255,0.03)",
                            }}
                            contentStyle={{
                                background:
                                    "rgba(15,23,42,0.95)",

                                border:
                                    "1px solid rgba(255,255,255,0.08)",

                                borderRadius:
                                    "18px",

                                backdropFilter:
                                    "blur(20px)",

                                color: "white",
                            }}
                        />

                        <Bar
                            dataKey="income"
                            radius={[
                                18,
                                18,
                                0,
                                0,
                            ]}
                            fill="url(#incomeGradient)"
                            animationDuration={
                                1500
                            }
                        />

                        <Bar
                            dataKey="expense"
                            radius={[
                                18,
                                18,
                                0,
                                0,
                            ]}
                            fill="url(#expenseGradient)"
                            animationDuration={
                                1800
                            }
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}