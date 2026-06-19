"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Receipt,
    LineChart,
    Target,
    Bot,
    Camera,
    Menu,
    X,
    Sparkles,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import LogoutButton from "@/components/shared/logout-button"

export default function Sidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
        { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
        { name: "Budgets & Goals", href: "/dashboard/budgets", icon: Target },
        { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
        { name: "Receipt Scanner", href: "/dashboard/scanner", icon: Camera },
    ]

    const toggleSidebar = () => setIsOpen(!isOpen)
    const closeSidebar = () => setIsOpen(false)

    return (
        <>
            {/* Mobile Header Banner */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#050816]/90 border-b border-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">
                        AI
                    </div>
                    <span className="font-extrabold text-white tracking-tight text-lg">
                        SmartExpense <span className="text-violet-400">AI</span>
                    </span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-[#050816]/95 border-r border-white/10 backdrop-blur-2xl p-6 flex flex-col justify-between z-50 transform lg:transform-none lg:opacity-100 transition-all duration-300 ${
                    isOpen ? "translate-x-0 opacity-100" : "-translate-x-full lg:translate-x-0 opacity-0"
                }`}
            >
                <div>
                    {/* Sidebar Logo */}
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-violet-500/20">
                            AI
                        </div>
                        <div>
                            <h2 className="font-extrabold text-white tracking-tight text-lg">
                                SmartExpense
                            </h2>
                            <p className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                                <Sparkles size={10} /> Premium Platform
                            </p>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all ${
                                        isActive
                                            ? "bg-gradient-to-r from-violet-600/35 to-cyan-500/10 border border-violet-500/30 text-white shadow-md shadow-violet-500/5"
                                            : "text-zinc-400 border border-transparent hover:text-white hover:bg-white/[0.03]"
                                    }`}
                                >
                                    <Icon
                                        size={20}
                                        className={`transition-colors ${
                                            isActive
                                                ? "text-violet-400"
                                                : "text-zinc-500 group-hover:text-zinc-300"
                                        }`}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Sidebar Bottom (User Card / Logout) */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                    {user && (
                        <div className="px-2">
                            <p className="text-xs text-zinc-500 font-medium">Logged in as</p>
                            <p className="text-sm font-bold text-zinc-300 truncate max-w-full" title={user.email || ""}>
                                {user.email}
                            </p>
                        </div>
                    )}
                    <div className="w-full">
                        <LogoutButton />
                    </div>
                </div>
            </aside>
        </>
    )
}
