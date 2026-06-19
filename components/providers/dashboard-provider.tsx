"use client"

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react"

import { useAuth } from "@/components/providers/auth-provider"
import { Expense } from "@/types/expense"
import { Budget } from "@/types/budget"
import { getExpenses } from "@/services/expense-service"
import { getBudgets } from "@/services/budget-service"

interface DashboardContextType {
    expenses: Expense[]
    budgets: Budget[]
    loading: boolean
    loadExpenses: () => Promise<void>
    loadBudgets: () => Promise<void>
    
    // Cached AI States
    copilotBriefing: string
    copilotAnalysis: any
    setCopilotData: (briefing: string, analysis: any) => void
    aiInsights: string
    setAiInsights: (insights: string) => void
    financialCoachAdvice: string
    setFinancialCoachAdvice: (advice: string) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)

    // AI Cached states
    const [copilotBriefing, setCopilotBriefing] = useState<string>("")
    const [copilotAnalysis, setCopilotAnalysis] = useState<any>(null)
    const [aiInsights, setAiInsights] = useState<string>("")
    const [financialCoachAdvice, setFinancialCoachAdvice] = useState<string>("")

    const setCopilotData = (briefing: string, analysis: any) => {
        setCopilotBriefing(briefing)
        setCopilotAnalysis(analysis)
    }

    async function loadExpenses() {
        try {
            const data = await getExpenses()
            setExpenses(data)
        } catch (error) {
            console.error("Failed to load expenses:", error)
        }
    }

    async function loadBudgets() {
        try {
            const data = await getBudgets()
            setBudgets(data)
        } catch (error) {
            console.error("Failed to load budgets:", error)
        }
    }

    useEffect(() => {
        async function initData() {
            if (user) {
                setLoading(true)
                await Promise.all([loadExpenses(), loadBudgets()])
                setLoading(false)
            } else {
                setExpenses([])
                setBudgets([])
                setCopilotBriefing("")
                setCopilotAnalysis(null)
                setAiInsights("")
                setFinancialCoachAdvice("")
                setLoading(false)
            }
        }
        if (!authLoading) {
            initData()
        }
    }, [user, authLoading])

    return (
        <DashboardContext.Provider
            value={{
                expenses,
                budgets,
                loading: loading || authLoading,
                loadExpenses,
                loadBudgets,
                copilotBriefing,
                copilotAnalysis,
                setCopilotData,
                aiInsights,
                setAiInsights,
                financialCoachAdvice,
                setFinancialCoachAdvice,
            }}
        >
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider")
    }
    return context
}
