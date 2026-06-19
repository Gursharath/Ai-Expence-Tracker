"use client"

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

const data = [
    { name: "Food", value: 400 },
    { name: "Travel", value: 300 },
    { name: "Shopping", value: 500 },
    { name: "Bills", value: 250 },
]

const COLORS = [
    "#8b5cf6",
    "#06b6d4",
    "#22c55e",
    "#f97316",
]

export default function ExpenseChart() {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-violet-500/10 blur-[120px]" />

            <div className="relative z-10 mb-8">
                <h2 className="text-3xl font-bold">
                    Expense Breakdown
                </h2>

                <p className="text-zinc-400 mt-2">
                    Visual spending intelligence
                </p>
            </div>

            <div className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <ResponsiveContainer
                    width="100%"
                    height={400}
                >
                    <PieChart>
                        <defs>
                            <filter id="pieGlow">
                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="10"
                                    floodColor="#06b6d4"
                                    floodOpacity="0.5"
                                />
                            </filter>
                        </defs>

                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={135}
                            innerRadius={70}
                            dataKey="value"
                            paddingAngle={5}
                            filter="url(#pieGlow)"
                            animationDuration={
                                2000
                            }
                        >
                            {data.map(
                                (_, index) => (
                                    <Cell
                                        key={
                                            index
                                        }
                                        fill={
                                            COLORS[
                                                index %
                                                    COLORS.length
                                            ]
                                        }
                                    />
                                )
                            )}
                        </Pie>

                        <Tooltip
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
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}