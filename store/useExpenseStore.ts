import { create } from 'zustand'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
}

interface ExpenseState {
  expenses: Expense[]
  setExpenses: (expenses: Expense[]) => void
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses })
}))