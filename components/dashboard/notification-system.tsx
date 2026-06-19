"use client"

import {
    useEffect,
} from "react"

import {
    Bell,
} from "lucide-react"

import { toast } from "sonner"

import { Expense } from "@/types/expense"

import { Budget } from "@/types/budget"

import {
    analyzeNotifications,
} from "@/utils/notifications"

export default function NotificationSystem({
    expenses,
    budgets,
}: {
    expenses: Expense[]

    budgets: Budget[]
}) {
    useEffect(() => {
        const notifications =
            analyzeNotifications(
                expenses,
                budgets
            )

        notifications.forEach(
            (message, index) => {
                setTimeout(() => {
                    toast(message, {
                        icon: (
                            <Bell
                                size={18}
                            />
                        ),

                        style: {
                            background:
                                "rgba(15,23,42,0.95)",

                            color:
                                "white",

                            border:
                                "1px solid rgba(255,255,255,0.08)",

                            borderRadius:
                                "18px",

                            backdropFilter:
                                "blur(20px)",
                        },
                    })
                }, index * 1200)
            }
        )
    }, [expenses, budgets])

    return null
}