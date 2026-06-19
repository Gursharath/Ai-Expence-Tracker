"use client"

import { supabase } from "@/lib/supabase"
import { Wallet, Sparkles, ShieldCheck } from "lucide-react"

export default function LoginPage() {
    async function loginWithGoogle() {
        await supabase.auth.signInWithOAuth({
            provider: "google",

            options: {
                redirectTo:
                    "http://localhost:3000/dashboard",
            },
        })
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-500 opacity-20 blur-3xl rounded-full" />

            <div className="absolute bottom-[-120px] right-[-100px] w-[400px] h-[400px] bg-cyan-500 opacity-20 blur-3xl rounded-full" />

            {/* Main Container */}
            <div className="relative z-10 grid lg:grid-cols-2 w-full max-w-6xl mx-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Left Section */}
                <div className="hidden lg:flex flex-col justify-between p-14 bg-gradient-to-br from-purple-600/20 to-cyan-500/10 border-r border-white/10">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-white/10">
                                <Wallet className="w-7 h-7 text-cyan-400" />
                            </div>

                            <h1 className="text-3xl font-bold">
                                FinAI Tracker
                            </h1>
                        </div>

                        <h2 className="text-5xl font-bold leading-tight mb-6">
                            Smart Finance
                            <br />
                            Powered by AI
                        </h2>

                        <p className="text-zinc-300 text-lg leading-relaxed">
                            Track expenses, monitor budgets,
                            generate AI insights, and take
                            control of your financial future.
                        </p>
                    </div>

                    <div className="space-y-5 mt-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-white/10">
                                <Sparkles className="text-purple-400 w-5 h-5" />
                            </div>

                            <p className="text-zinc-300">
                                AI-powered spending insights
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-white/10">
                                <ShieldCheck className="text-cyan-400 w-5 h-5" />
                            </div>

                            <p className="text-zinc-300">
                                Secure cloud-based finance tracking
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-center p-8 sm:p-14">
                    <div className="w-full max-w-md">
                        <div className="mb-10">
                            <p className="text-cyan-400 font-semibold mb-3 tracking-wide uppercase">
                                Welcome Back
                            </p>

                            <h1 className="text-4xl font-bold mb-4">
                                Login to your account
                            </h1>

                            <p className="text-zinc-400 leading-relaxed">
                                Continue managing your finances
                                with your smart AI assistant.
                            </p>
                        </div>

                        <button
                            onClick={loginWithGoogle}
                            className="w-full bg-white text-black font-semibold py-4 rounded-2xl hover:scale-[1.02] hover:bg-zinc-200 transition-all duration-300 shadow-xl"
                        >
                            Continue with Google
                        </button>

                        <p className="text-sm text-zinc-500 text-center mt-6">
                            Secure authentication powered by Google
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}