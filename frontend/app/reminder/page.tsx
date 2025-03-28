"use client";

/**
 * Reminder page
 *
 * Display user's reminders
 */
import { useState, useEffect } from "react";
import { useReminders } from "../contexts/ReminderContext";
import { Reminder } from "../api/reminder";
import { useAuth } from "@/app/contexts/AuthContext";

// components
import Layout from "@/components/ui/Layout";
import { ReminderList } from "@/components/ui/Reminder/ReminderList";
import NewReminderForm from "@/components/ui/Reminder/NewReminderModal";

export default function ReminderPage() {
    const { reminders, getReminders } = useReminders();
    const { user } = useAuth();
    const [data, setData] = useState<Reminder[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const fetchReminders = async () => {
        try {
            const success = await getReminders(
                user?.id || (localStorage.getItem("userid") as string)
            );
            if (success) {
                setData(reminders);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("Reminders fetch failed!");
            }
        }
    };

    useEffect(() => {
        fetchReminders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        setData(reminders);
    }, [reminders]);

    const toggleForm = () => {
        setIsAdding((prev) => !prev);
    };

    return (
        <Layout title="Reminders">
            <div className="flex items-center mb-6">
                <button
                    className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 ml-auto"
                    onClick={toggleForm}
                >
                    + Create Reminder
                </button>
            </div>

            {isAdding && (
                <NewReminderForm
                    toggle={toggleForm}
                    refreshReminders={fetchReminders}
                />
            )}

            <ReminderList reminders={data} refreshReminders={fetchReminders} />
        </Layout>
    );
}
