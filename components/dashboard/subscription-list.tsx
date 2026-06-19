"use client"

import {
    Repeat,
    CreditCard,
} from "lucide-react"

import { Expense } from "@/types/expense"

import {
    detectSubscriptions,
} from "@/utils/subscription-detector"

export default function SubscriptionList({
    expenses,
}: {
    expenses: Expense[]
}) {
    const subscriptions =
        detectSubscriptions(
            expenses
        )

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                    <Repeat className="text-violet-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold">
                        Smart Subscriptions
                    </h2>

                    <p className="text-zinc-400">
                        AI detected recurring payments
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {subscriptions.length ===
                    0 ? (
                    <div className="border border-dashed border-white/10 rounded-3xl py-16 text-center">
                        <p className="text-zinc-400">
                            No subscriptions detected
                        </p>
                    </div>
                ) : (
                    subscriptions.map(
                        (
                            subscription,
                            index
                        ) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                                        <CreditCard className="text-cyan-400" />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-lg capitalize">
                                            {
                                                subscription.description
                                            }
                                        </p>

                                        <p className="text-sm text-zinc-400 mt-1">
                                            Detected{" "}
                                            {
                                                subscription.count
                                            }{" "}
                                            recurring payments
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">
                                        $
                                        {
                                            subscription.amount
                                        }
                                    </p>
                                </div>
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    )
}