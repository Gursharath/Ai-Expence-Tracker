"use client"

import {
    useState,
} from "react"

import ReactMarkdown from "react-markdown"

import {
    Mic,
    Pause,
    Play,
    Square,
    Bot,
    Sparkles,
    Volume2,
} from "lucide-react"

import { Expense } from "@/types/expense"

declare global {
    interface Window {
        webkitSpeechRecognition: any
    }
}

export default function VoiceAssistant({
    expenses,
}: {
    expenses: Expense[]
}) {
    const [listening, setListening] =
        useState(false)

    const [speaking, setSpeaking] =
        useState(false)

    const [paused, setPaused] =
        useState(false)

    const [transcript, setTranscript] =
        useState("")

    const [response, setResponse] =
        useState("")

    /* =========================
       START LISTENING
    ========================= */

    async function startListening() {
        const SpeechRecognition =
            window
                .webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert(
                "Speech recognition not supported"
            )

            return
        }

        const recognition =
            new SpeechRecognition()

        recognition.lang = "en-US"

        recognition.interimResults =
            false

        recognition.start()

        setListening(true)

        recognition.onresult =
            async (event: any) => {
                const text =
                    event.results[0][0]
                        .transcript

                setTranscript(text)

                setListening(false)

                await askAI(text)
            }

        recognition.onerror = () => {
            setListening(false)
        }

        recognition.onend = () => {
            setListening(false)
        }
    }

    /* =========================
       ASK AI
    ========================= */

    async function askAI(
        question: string
    ) {
        try {
            const response =
                await fetch(
                    "/api/ai-chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            expenses,

                            messages: [
                                {
                                    role: "user",

                                    content:
                                        question,
                                },
                            ],
                        }),
                    }
                )

            const data =
                await response.json()

            setResponse(data.message)

            speakResponse(
                data.message
            )
        } catch (error) {
            console.error(error)
        }
    }

    /* =========================
       SPEAK
    ========================= */

    function speakResponse(
        text: string
    ) {
        speechSynthesis.cancel()

        const utterance =
            new SpeechSynthesisUtterance(
                text
            )

        utterance.rate = 1

        utterance.pitch = 1

        utterance.volume = 1

        utterance.onstart = () => {
            setSpeaking(true)
            setPaused(false)
        }

        utterance.onend = () => {
            setSpeaking(false)
            setPaused(false)
        }

        speechSynthesis.speak(
            utterance
        )
    }

    function stopSpeech() {
        speechSynthesis.cancel()

        setSpeaking(false)

        setPaused(false)
    }

    function pauseSpeech() {
        speechSynthesis.pause()

        setPaused(true)
    }

    function resumeSpeech() {
        speechSynthesis.resume()

        setPaused(false)
    }

    return (
        <div>
            {/* HEADER */}

            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-3xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <Bot className="text-violet-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Voice AI Assistant
                    </h2>

                    <p className="text-zinc-400 mt-1">
                        Real-time AI voice powered financial assistant
                    </p>
                </div>
            </div>

            {/* MAIN PANEL */}

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 backdrop-blur-xl">
                {/* Glow */}

                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[140px]" />

                {/* VOICE VISUALIZER */}

                <div className="relative z-10 flex flex-col items-center justify-center">
                    <div
                        className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${listening
                                ? "bg-red-500/20 scale-110"
                                : speaking
                                    ? "bg-cyan-500/20"
                                    : "bg-violet-500/15"
                            }`}
                    >
                        {/* Outer Pulse */}

                        <div
                            className={`absolute inset-0 rounded-full ${listening ||
                                    speaking
                                    ? "animate-ping bg-violet-500/20"
                                    : ""
                                }`}
                        />

                        {/* Inner */}

                        <div className="relative w-28 h-28 rounded-full bg-black/30 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                            {listening ? (
                                <Mic
                                    size={40}
                                    className="text-red-400 animate-pulse"
                                />
                            ) : speaking ? (
                                <Volume2
                                    size={40}
                                    className="text-cyan-400 animate-pulse"
                                />
                            ) : (
                                <Sparkles
                                    size={40}
                                    className="text-violet-400"
                                />
                            )}
                        </div>
                    </div>

                    {/* STATUS */}

                    <div className="mt-8 text-center">
                        <h3 className="text-2xl font-bold">
                            {listening
                                ? "Listening..."
                                : speaking
                                    ? "AI Speaking..."
                                    : "Ready to Assist"}
                        </h3>

                        <p className="text-zinc-400 mt-2">
                            {listening
                                ? "Speak naturally to your AI assistant"
                                : "Tap the microphone to start"}
                        </p>
                    </div>

                    {/* CONTROLS */}

                    <div className="flex flex-wrap justify-center gap-4 mt-10">
                        <button
                            onClick={
                                startListening
                            }
                            className={`group px-7 py-4 rounded-3xl text-white font-semibold flex items-center gap-3 transition-all shadow-lg ${listening
                                    ? "bg-red-500 shadow-red-500/30 animate-pulse"
                                    : "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-violet-500/20 hover:scale-[1.03]"
                                }`}
                        >
                            <Mic
                                size={20}
                            />

                            {listening
                                ? "Listening..."
                                : "Start Voice AI"}
                        </button>

                        {speaking && (
                            <>
                                {!paused ? (
                                    <button
                                        onClick={
                                            pauseSpeech
                                        }
                                        className="bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-4 rounded-3xl flex items-center gap-3 transition-all"
                                    >
                                        <Pause
                                            size={
                                                18
                                            }
                                        />

                                        Pause
                                    </button>
                                ) : (
                                    <button
                                        onClick={
                                            resumeSpeech
                                        }
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-3xl flex items-center gap-3 transition-all"
                                    >
                                        <Play
                                            size={
                                                18
                                            }
                                        />

                                        Resume
                                    </button>
                                )}

                                <button
                                    onClick={
                                        stopSpeech
                                    }
                                    className="bg-red-500 hover:bg-red-400 text-white px-6 py-4 rounded-3xl flex items-center gap-3 transition-all"
                                >
                                    <Square
                                        size={
                                            18
                                        }
                                    />

                                    Stop
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* TRANSCRIPT */}

            {transcript && (
                <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
                    <p className="text-cyan-400 text-sm font-semibold mb-4 uppercase tracking-wider">
                        You Said
                    </p>

                    <p className="text-xl text-white leading-9">
                        {transcript}
                    </p>
                </div>
            )}

            {/* AI RESPONSE */}

            {response && (
                <div className="mt-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-10 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                            <Bot className="text-violet-400" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold">
                                AI Response
                            </h3>

                            <p className="text-zinc-400">
                                Smart financial voice analysis
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({
                                    children,
                                }) => (
                                    <h1 className="text-3xl font-bold mb-6">
                                        {children}
                                    </h1>
                                ),

                                h2: ({
                                    children,
                                }) => (
                                    <h2 className="text-2xl font-semibold mt-8 mb-5 text-cyan-300">
                                        {children}
                                    </h2>
                                ),

                                p: ({
                                    children,
                                }) => (
                                    <p className="text-zinc-300 leading-9 text-[17px] mb-5">
                                        {children}
                                    </p>
                                ),

                                strong: ({
                                    children,
                                }) => (
                                    <strong className="text-white">
                                        {children}
                                    </strong>
                                ),

                                ul: ({
                                    children,
                                }) => (
                                    <ul className="space-y-4 my-5">
                                        {children}
                                    </ul>
                                ),

                                li: ({
                                    children,
                                }) => (
                                    <li className="flex gap-3 leading-8">
                                        <span className="w-2 h-2 rounded-full bg-violet-400 mt-3 shrink-0" />

                                        <span>
                                            {children}
                                        </span>
                                    </li>
                                ),
                            }}
                        >
                            {response}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    )
}