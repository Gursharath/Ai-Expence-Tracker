"use client"

import {
    useCallback,
    useState,
} from "react"

import { useDropzone } from "react-dropzone"

import {
    ScanLine,
    UploadCloud,
    CheckCircle2,
} from "lucide-react"

import { extractReceiptText } from "@/utils/ocr"

import {
    parseReceiptText,
    ParsedReceipt,
} from "@/utils/receipt-parser"

import { useAuth } from "@/components/providers/auth-provider"

import { addExpense } from "@/services/expense-service"

export default function ReceiptScanner() {
    const { user } = useAuth()

    const [loading, setLoading] =
        useState(false)

    const [text, setText] =
        useState("")

    const [preview, setPreview] =
        useState<string | null>(null)

    const [parsedData, setParsedData] =
        useState<ParsedReceipt | null>(
            null
        )

    const [saving, setSaving] =
        useState(false)

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]

            if (!file) return

            setLoading(true)

            setPreview(
                URL.createObjectURL(file)
            )

            const extractedText =
                await extractReceiptText(
                    file
                )

            setText(extractedText)

            const parsed =
                parseReceiptText(
                    extractedText
                )

            setParsedData(parsed)

            setLoading(false)
        },
        []
    )

    async function saveExpense() {
        if (!parsedData || !user)
            return

        try {
            setSaving(true)

            await addExpense({
                user_id: user.id,
                amount: parsedData.amount,
                category:
                    parsedData.category,
                description:
                    parsedData.description,
                date: parsedData.date,
                type: "expense",
                is_recurring: false,
            })

            alert(
                "Expense added successfully!"
            )
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        onDrop,

        accept: {
            "image/*": [],
        },

        multiple: false,
    })

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
                    <ScanLine className="text-cyan-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Smart Receipt Scanner
                    </h2>

                    <p className="text-zinc-400">
                        AI powered OCR receipt extraction
                    </p>
                </div>
            </div>

            <div
                {...getRootProps()}
                className="border-2 border-dashed border-white/10 hover:border-cyan-400/40 transition rounded-3xl p-12 text-center cursor-pointer bg-white/[0.03]"
            >
                <input {...getInputProps()} />

                <UploadCloud className="mx-auto text-cyan-400 mb-5" size={40} />

                <p className="text-lg font-medium">
                    Upload receipt image
                </p>

                <p className="text-zinc-400 mt-2">
                    Drag & drop or click to upload
                </p>
            </div>

            {loading && (
                <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
                    Extracting receipt data...
                </div>
            )}

            {preview && (
                <div className="mt-8">
                    <img
                        src={preview}
                        alt="Receipt"
                        className="rounded-3xl max-h-96 border border-white/10"
                    />
                </div>
            )}

            {parsedData && (
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="text-emerald-400" />

                        <h3 className="text-2xl font-bold">
                            Parsed Expense
                        </h3>
                    </div>

                    <div className="space-y-4 text-zinc-300">
                        <p>
                            <strong>Amount:</strong>{" "}
                            ${parsedData.amount}
                        </p>

                        <p>
                            <strong>Category:</strong>{" "}
                            {parsedData.category}
                        </p>

                        <p>
                            <strong>Description:</strong>{" "}
                            {
                                parsedData.description
                            }
                        </p>
                    </div>

                    <button
                        onClick={saveExpense}
                        disabled={saving}
                        className="mt-8 bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-6 py-4 rounded-2xl font-semibold"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Expense"}
                    </button>
                </div>
            )}

            {text && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">
                        OCR Extracted Text
                    </h3>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-6 whitespace-pre-wrap text-sm max-h-96 overflow-y-auto text-zinc-300">
                        {text}
                    </div>
                </div>
            )}
        </div>
    )
}