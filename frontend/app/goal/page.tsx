"use client";

import { useState, useEffect } from "react";
import { useGoals } from "@/app/contexts/GoalContext";
import { Goal } from "../api/goal";
import { useAuth } from "@/app/contexts/AuthContext";

// components
import Layout from "@/components/ui/Layout";
import TransactionList from "@/components/ui/TransactionList";
import { FloatingButton, FilterButton } from "@/components/ui/Button";
import TransactionFormModal from "@/components/ui/TransactionFormModal";
import { SearchBar } from "@/components/ui/Input";
import TagList from "@/components/ui/TagList";

export default function GoalsPage() {
    const { goals, getGoals } = useGoals();
    const { user } = useAuth();
    const [data, setData] = useState<Goal[]>([]);


    const getDataOnRender = async () => {
        try {
            const success = await getGoals(
                user?.id || (localStorage.getItem("userid") as string)
            );
            if (success) {
                setData(goals);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("Goals fetch failed!");
            }
        }
    };

    useEffect(() => {
        getDataOnRender();
    }, [user]);

    useEffect(() => {
        setData(goals);
    }, [goals]);


    return (
        <Layout title="Goals" >
            <p>Goal page content......</p>
        </Layout>
    );
};
