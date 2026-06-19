import Link from "next/link"

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h1 className="text-2xl font-bold">
                    SmartExpense AI
                </h1>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-zinc-300 hover:text-white transition"
                    >
                        Login
                    </Link>

                    <Link
                        href="/dashboard"
                        className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:opacity-90 transition"
                    >
                        Dashboard
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-8 py-28 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm mb-6">
                        ✨ AI Powered Finance Platform
                    </div>

                    <h1 className="text-6xl font-bold leading-tight">
                        Your Smart AI
                        <br />
                        Financial Assistant
                    </h1>

                    <p className="text-zinc-400 text-xl mt-8 leading-relaxed">
                        Track expenses, predict future spending,
                        scan receipts, generate AI reports, and
                        manage your finances using powerful AI.
                    </p>

                    <div className="flex flex-wrap gap-4 mt-10">
                        <Link
                            href="/dashboard"
                            className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition"
                        >
                            Get Started
                        </Link>

                        <Link
                            href="/login"
                            className="border border-white/20 px-8 py-4 rounded-2xl hover:bg-white/10 transition"
                        >
                            Login
                        </Link>
                    </div>

                    <div className="flex items-center gap-10 mt-16">
                        <div>
                            <h3 className="text-3xl font-bold">
                                10K+
                            </h3>

                            <p className="text-zinc-400">
                                Expenses Tracked
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold">
                                AI
                            </h3>

                            <p className="text-zinc-400">
                                Powered Insights
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold">
                                Smart
                            </h3>

                            <p className="text-zinc-400">
                                Automation
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side Dashboard Mock */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-[120px] opacity-20" />

                    <div className="relative bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/20 border border-green-500/20 rounded-2xl p-5">
                                <p className="text-sm text-zinc-300">
                                    Income
                                </p>

                                <h3 className="text-3xl font-bold mt-3">
                                    $8,420
                                </h3>
                            </div>

                            <div className="bg-red-500/20 border border-red-500/20 rounded-2xl p-5">
                                <p className="text-sm text-zinc-300">
                                    Expenses
                                </p>

                                <h3 className="text-3xl font-bold mt-3">
                                    $2,150
                                </h3>
                            </div>
                        </div>

                        <div className="mt-6 bg-white/5 rounded-2xl p-6">
                            <h3 className="font-semibold text-lg">
                                AI Insights
                            </h3>

                            <p className="text-zinc-400 mt-4 leading-relaxed">
                                Your savings increased by 24% this
                                month. Food spending remains stable.
                                Consider reducing travel expenses.
                            </p>
                        </div>

                        <div className="mt-6 bg-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    Financial Health
                                </h3>

                                <span className="text-green-400 font-bold">
                                    82/100
                                </span>
                            </div>

                            <div className="w-full bg-white/10 h-3 rounded-full mt-5 overflow-hidden">
                                <div className="bg-green-400 h-full w-[82%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-8 py-24">
                <div className="text-center">
                    <h2 className="text-5xl font-bold">
                        Powerful AI Features
                    </h2>

                    <p className="text-zinc-400 mt-6 text-xl">
                        Everything you need to manage your
                        finances intelligently.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
                    {[
                        {
                            title: "AI Insights",
                            desc: "Get personalized AI-powered financial analysis.",
                        },

                        {
                            title: "Voice Assistant",
                            desc: "Talk naturally with your AI finance assistant.",
                        },

                        {
                            title: "Receipt Scanner",
                            desc: "Scan receipts using OCR and auto-save expenses.",
                        },

                        {
                            title: "Expense Predictions",
                            desc: "Predict future spending patterns using AI.",
                        },

                        {
                            title: "Smart Notifications",
                            desc: "Receive alerts for overspending and budgets.",
                        },

                        {
                            title: "PDF Reports",
                            desc: "Generate professional AI financial reports.",
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition"
                        >
                            <h3 className="text-2xl font-semibold">
                                {feature.title}
                            </h3>

                            <p className="text-zinc-400 mt-5 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-8 py-24">
                <div className="bg-white text-black rounded-[40px] p-16 text-center shadow-2xl">
                    <h2 className="text-5xl font-bold leading-tight">
                        Ready to transform
                        <br />
                        your finances?
                    </h2>

                    <p className="text-zinc-600 text-xl mt-8">
                        Start using AI-powered expense tracking
                        today.
                    </p>

                    <Link
                        href="/dashboard"
                        className="inline-block mt-10 bg-black text-white px-10 py-5 rounded-2xl font-semibold hover:opacity-90 transition"
                    >
                        Launch Dashboard
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-10 px-8 text-center text-zinc-500">
                © 2026 SmartExpense AI. All rights reserved.
            </footer>
        </main>
    )
}