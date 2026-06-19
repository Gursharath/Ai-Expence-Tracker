"use client"

import Sidebar from "@/components/dashboard/sidebar"
import { DashboardProvider, useDashboard } from "@/components/providers/dashboard-provider"
import NotificationSystem from "@/components/dashboard/notification-system"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { expenses, budgets, loading } = useDashboard()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card px-10 py-6">
                    <p className="text-lg font-medium text-zinc-300 animate-pulse">
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#050816]">
            {/* Global notification alerts */}
            <NotificationSystem expenses={expenses} budgets={budgets} />

            {/* Sidebar navigation */}
            <Sidebar />

            {/* Page content */}
            <main className="flex-1 lg:pl-64 min-h-screen overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </DashboardProvider>
    )
}
