"use client"

import {
    LogOut,
} from "lucide-react"

import { supabase } from "@/lib/supabase"

export default function LogoutButton() {
    async function handleLogout() {
        await supabase.auth.signOut()

        window.location.href = "/login"
    }

    return (
        <button
            onClick={handleLogout}
            className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 px-6 py-3 text-red-400 font-semibold flex items-center gap-3"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition" />

            <LogOut size={18} />

            <span>Logout</span>
        </button>
    )
}