"use client"

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

const COLORS = [
    "#8b5cf6",
    "#06b6d4",
    "#22c55e",
    "#f97316",
    "#ef4444",
    "#3b82f6",
]

export default function CategoryPieChart({
    data,
}: {
    data: {
        name: string
        value: number
    }[]
}) {
    return (
        <div className="relative overflow-hidden">
            {/* Glow Effect */}

            <div className="absolute left-0 bottom-0 w-72 h-72 bg-cyan-500/10 blur-[120px]" />

            <div className="relative z-10 mb-8">
                <h2 className="text-3xl font-bold">
                    Expense Categories
                </h2>

                <p className="text-zinc-400 mt-2">
                    Smart category distribution analytics
                </p>
            </div>

            <div className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <ResponsiveContainer
                    width="100%"
                    height={420}
                >
                    <PieChart>
                        <defs>
                            <filter id="shadow">
                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="12"
                                    floodColor="#8b5cf6"
                                    floodOpacity="0.4"
                                />
                            </filter>
                        </defs>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={140}
                            innerRadius={75}
                            paddingAngle={5}
                            animationBegin={200}
                            animationDuration={
                                1800
                            }
                            filter="url(#shadow)"
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

                        <Legend
                            wrapperStyle={{
                                color:
                                    "#d4d4d8",
                                paddingTop:
                                    "20px",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}