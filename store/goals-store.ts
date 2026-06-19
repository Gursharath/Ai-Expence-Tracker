import { create } from "zustand"

import { Goal } from "@/types/goal"

interface GoalStore {
    goals: Goal[]

    addGoal: (
        goal: Goal
    ) => void

    removeGoal: (
        title: string
    ) => void
}

export const useGoalsStore =
    create<GoalStore>(
        (set) => ({
            goals: [],

            addGoal: (
                goal
            ) =>
                set((state) => ({
                    goals: [
                        ...state.goals,
                        goal,
                    ],
                })),

            removeGoal: (
                title
            ) =>
                set((state) => ({
                    goals:
                        state.goals.filter(
                            (goal) =>
                                goal.title !==
                                title
                        ),
                })),
        })
    )