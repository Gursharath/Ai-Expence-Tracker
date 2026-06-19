"use client"

import {
    useEffect,
    useRef,
    useState,
} from "react"

import ReactMarkdown from "react-markdown"

import {
    Bot,
    SendHorizonal,
    Sparkles,
    User,
} from "lucide-react"

import { Expense } from "@/types/expense"

import { ChatMessage } from "@/types/chat"

export default function AIChatbot({
    expenses,
}: {
    expenses: Expense[]
}) {
    const [messages, setMessages] =
        useState<ChatMessage[]>([
            {
                role: "assistant",

                content:
                    `
# Welcome 👋

I'm your AI Finance Assistant.

I can help you with:

- Spending analysis
- Budget optimization
- Saving strategies
- Subscription detection
- Financial health insights
- Expense recommendations

Ask me anything about your finances.
`,
            },
        ])

    const [input, setInput] =
        useState("")

    const [loading, setLoading] =
        useState(false)

    const bottomRef =
        useRef<HTMLDivElement>(null)

    /* =========================
       AUTO SCROLL
    ========================= */

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        })
    }, [messages])

    /* =========================
       SEND MESSAGE
    ========================= */

    async function sendMessage() {
        if (!input.trim()) return

        const userMessage: ChatMessage =
        {
            role: "user",
            content: input,
        }

        const updatedMessages = [
            ...messages,
            userMessage,
        ]

        setMessages(updatedMessages)

        setInput("")

        try {
            setLoading(true)

            const response = await fetch(
                "/api/ai-chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        messages:
                            updatedMessages,

                        expenses,
                    }),
                }
            )

            const data =
                await response.json()

            setMessages([
                ...updatedMessages,

                {
                    role: "assistant",
                    content:
                        data.message,
                },
            ])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* HEADER */}

            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-3xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <Bot className="text-violet-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        AI Finance Assistant
                    </h2>

                    <p className="text-zinc-400 mt-1">
                        Intelligent AI-powered financial advisor
                    </p>
                </div>
            </div>

            {/* CHAT AREA */}

            <div className="relative overflow-hidden h-[650px] rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl">
                {/* Glow */}

                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[140px]" />

                {/* Messages */}

                <div className="relative z-10 h-full overflow-y-auto p-8 space-y-8">
                    {messages.map(
                        (
                            message,
                            index
                        ) => (
                            <div
                                key={index}
                                className={`flex gap-4 ${message.role ===
                                        "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                            >
                                {/* AI */}

                                {message.role ===
                                    "assistant" && (
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                                            <Sparkles className="text-violet-400" />
                                        </div>
                                    )}

                                {/* Bubble */}

                                <div
                                    className={`max-w-[80%] rounded-[28px] px-6 py-5 ${message.role ===
                                            "user"
                                            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20"
                                            : "bg-white/[0.04] border border-white/10 text-zinc-200"
                                        }`}
                                >
                                    <div className="prose prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h1:
                                                    ({
                                                        children,
                                                    }) => (
                                                        <h1 className="text-2xl font-bold mb-5 text-white">
                                                            {
                                                                children
                                                            }
                                                        </h1>
                                                    ),

                                                h2:
                                                    ({
                                                        children,
                                                    }) => (
                                                        <h2 className="text-xl font-semibold mt-6 mb-4 text-cyan-300">
                                                            {
                                                                children
                                                            }
                                                        </h2>
                                                    ),

                                                p: ({
                                                    children,
                                                }) => (
                                                    <p className="leading-8 text-[15px] mb-4">
                                                        {
                                                            children
                                                        }
                                                    </p>
                                                ),

                                                strong:
                                                    ({
                                                        children,
                                                    }) => (
                                                        <strong className="text-white font-semibold">
                                                            {
                                                                children
                                                            }
                                                        </strong>
                                                    ),

                                                ul: ({
                                                    children,
                                                }) => (
                                                    <ul className="space-y-3 my-4">
                                                        {
                                                            children
                                                        }
                                                    </ul>
                                                ),

                                                li: ({
                                                    children,
                                                }) => (
                                                    <li className="flex items-start gap-3 leading-7">
                                                        <span className="w-2 h-2 rounded-full bg-cyan-400 mt-3 shrink-0" />

                                                        <span>
                                                            {
                                                                children
                                                            }
                                                        </span>
                                                    </li>
                                                ),
                                            }}
                                        >
                                            {
                                                message.content
                                            }
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {/* USER */}

                                {message.role ===
                                    "user" && (
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                            <User className="text-cyan-400" />
                                        </div>
                                    )}
                            </div>
                        )
                    )}

                    {/* LOADING */}

                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <Sparkles className="text-violet-400 animate-pulse" />
                            </div>

                            <div className="bg-white/[0.04] border border-white/10 rounded-[28px] px-6 py-5">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" />

                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />

                                    <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>

            {/* INPUT */}

            <div className="flex gap-4 mt-6">
                <div className="flex-1 relative">
                    <input
                        value={input}
                        onChange={(e) =>
                            setInput(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {
                            if (
                                e.key ===
                                "Enter" &&
                                !loading
                            ) {
                                sendMessage()
                            }
                        }}
                        placeholder="Ask AI about your finances..."
                        className="w-full px-6 py-5 pr-16 rounded-3xl bg-white/[0.04] border border-white/10 focus:border-violet-500 transition-all"
                    />

                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500">
                        AI
                    </div>
                </div>

                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="group px-7 rounded-3xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-violet-500/20"
                >
                    <SendHorizonal
                        size={20}
                        className="group-hover:translate-x-1 transition"
                    />

                    Send
                </button>
            </div>
        </div>
    )
}