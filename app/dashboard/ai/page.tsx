"use client"

import { Bot, Sparkles } from "lucide-react"

import AIChatbot from "@/components/dashboard/ai-chatbot"
import VoiceAssistant from "@/components/dashboard/voice-assistant"
import FinancialCoach from "@/components/dashboard/financial-coach"
import AIInsights from "@/components/dashboard/ai-insights"
import PredictionCard from "@/components/dashboard/prediction-card"
import { useDashboard } from "@/components/providers/dashboard-provider"
import FadeIn from "@/components/shared/fade-in"

export default function AIAssistantPage() {
    const { expenses } = useDashboard()

    return (
        <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-6">
            {/* HEADER */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <Bot className="text-violet-400" size={22} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-2">
                                <Sparkles size={12} />
                                Intelligent Financial Advice
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight">
                                AI Financial Assistant
                            </h1>

                            <p className="text-zinc-400 mt-1.5 text-sm">
                                Chat with your smart AI assistant, converse using real-time Voice AI, and consult your dedicated automated financial coach.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* AI COMPONENTS STACKED VERTICALLY */}
            <div className="space-y-12">
                <FadeIn delay={0.1}>
                    <AIChatbot expenses={expenses} />
                </FadeIn>

                <FadeIn delay={0.15}>
                    <VoiceAssistant expenses={expenses} />
                </FadeIn>

                <FadeIn delay={0.2}>
                    <FinancialCoach expenses={expenses} />
                </FadeIn>

                <FadeIn delay={0.25}>
                    <PredictionCard expenses={expenses} />
                </FadeIn>

                <FadeIn delay={0.3}>
                    <AIInsights expenses={expenses} />
                </FadeIn>
            </div>
        </div>
    )
}
