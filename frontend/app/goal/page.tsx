"use client";

/**
 * Goal page
 *
 * Display user's goals
 */
import { useState, useEffect } from "react";
import { useGoals } from "@/app/contexts/GoalContext";
import { Goal } from "../api/goal";
import { useAuth } from "@/app/contexts/AuthContext";
import Layout from "@/components/ui/Layout";
import GoalList from "@/components/ui/Goal/GoalList";
import NewGoalForm from "@/components/ui/Goal/NewGoalModal";

export default function GoalsPage() {
    const { goals, getGoals } = useGoals();
    const { user } = useAuth();
    const [data, setData] = useState<Goal[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const fetchGoals = async () => {
        try {
            const success = await getGoals(
                user?.id || (localStorage.getItem("userid") as string)
            );
            if (success) setData(goals);
        } catch (err) {
            console.error(
                err instanceof Error ? err.message : "Goals fetch failed!"
            );
        }
    };

    // get goals data when the user data is available
    useEffect(() => {
        fetchGoals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        setData(goals);
    }, [goals]);

    const toggleForm = () => {
        setIsAdding((prev) => !prev);
    };

    return (
        <Layout title="Goals">
            <div className="flex justify-end mb-6">
                <button
                    onClick={toggleForm}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-all"
                >
                    + Create Goal
                </button>
            </div>

            {isAdding && (
                <NewGoalForm toggle={toggleForm} refreshGoals={fetchGoals} />
            )}

            <GoalList goals={data} refreshGoals={fetchGoals} />
        </Layout>
    );
}
