"use client";

/**
 * Goal List
 *
 * Grid to hold the goal cards
 */
import React from "react";
import GoalCard from "./GoalCard";
import { Goal } from "@/app/api/goal";

interface GoalListProps {
    goals: Goal[];
    refreshGoals: () => void;
}

export default function GoalList({ goals, refreshGoals }: GoalListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {goals.length > 0 ? (
                goals.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        refreshGoals={refreshGoals}
                    />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">
                    No goals found.
                </p>
            )}
        </div>
    );
}
