'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {useReminders} from "@/app/contexts/ReminderContext";
import {useEffect} from "react";
import {useAuth} from "@/app/contexts/AuthContext";

export default function DashboardReminderCard() {
    const router = useRouter();
    const {user} = useAuth();
    const { reminders, getReminders } = useReminders();

    useEffect(() => {
        const userId = user?.id || localStorage.getItem("userid");
        if (userId) getReminders(userId);
    }, []);

    // pick up latest 3
    const upcoming = [...reminders]
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .slice(0, 4);

    return (
        <div className="bg-black p-4 rounded-xl shadow flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold text-lg">Reminders</h2>
                <button
                    className="text-blue-400 text-sm hover:underline"
                    onClick={() => router.push("/reminder")}
                >
                    See More
                </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto text-sm text-white">
                {upcoming.map((reminder) => (
                    <div
                        key={reminder.id}
                        className="border border-gray-600 rounded-lg px-3 py-2 bg-black"
                    >
                        <p className="text-yellow-400 text-lg font-semibold italic">{reminder.name}</p>
                        <div className="flex justify-between items-center mt-1 text-sm">
                          <span className="text-yellow-300">
                            {format(new Date(reminder.time), "MMM d, yyyy, h:mm a")}
                          </span>
                            {reminder.text && (
                                <span className="italic text-gray-400 text-right">
                                  Note: {reminder.text}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}