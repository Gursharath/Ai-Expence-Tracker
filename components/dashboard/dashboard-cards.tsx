"use client"

import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PiggyBank,
} from "lucide-react"

export default function DashboardCards() {
    const cards = [
        {
            title: "Total Income",
            value: "$12,450",
            icon: ArrowUpRight,
            color:
                "from-emerald-500/20 to-green-500/10",
            text: "text-emerald-400",
        },

        {
            title: "Total Expenses",
            value: "$5,240",
            icon: ArrowDownRight,
            color:
                "from-red-500/20 to-orange-500/10",
            text: "text-red-400",
        },

        {
            title: "Savings",
            value: "$7,210",
            icon: Wallet,
            color:
                "from-violet-500/20 to-cyan-500/10",
            text: "text-violet-400",
        },

        {
            title: "Budget Left",
            value: "$1,760",
            icon: PiggyBank,
            color:
                "from-cyan-500/20 to-blue-500/10",
            text: "text-cyan-400",
        },
    ]

    return (
        <div className="dashboard-grid">
            {cards.map((card) => {
                const Icon = card.icon

                return (
                    <div
                        key={card.title}
                        className={`glass-card glass-card-hover bg-gradient-to-br ${card.color} p-7 relative overflow-hidden`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-zinc-400">
                                    {card.title}
                                </p>

                                <h2 className="text-4xl font-bold mt-4">
                                    {card.value}
                                </h2>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Icon
                                    className={card.text}
                                    size={28}
                                />
                            </div>
                        </div>

                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    </div>
                )
            })}
        </div>
    )
}