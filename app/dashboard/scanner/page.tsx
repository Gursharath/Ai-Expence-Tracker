"use client"

import { Camera, Sparkles } from "lucide-react"

import ReceiptScanner from "@/components/dashboard/receipt-scanner"
import FadeIn from "@/components/shared/fade-in"

export default function ReceiptScannerPage() {
    return (
        <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-6">
            {/* HEADER */}
            <FadeIn>
                <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <Camera className="text-violet-400" size={22} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-2">
                                <Sparkles size={12} />
                                OCR Document Scanning
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight">
                                Receipt Scanner
                            </h1>

                            <p className="text-zinc-400 mt-1.5 text-sm">
                                Upload image receipts, extract expense categories and amounts automatically with OCR technology, and log them instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* SCANNER */}
            <FadeIn delay={0.1}>
                <div className="glass-card p-6">
                    <ReceiptScanner />
                </div>
            </FadeIn>
        </div>
    )
}
