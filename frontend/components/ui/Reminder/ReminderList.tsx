"use client";

/**
 * Reminder List
 *
 * Used by reminder page and notificaiton
 */
import React from "react";
import ReminderCard from "./ReminderCard";
import { Reminder } from "@/app/api/reminder";

interface ReminderListProps {
    reminders: Reminder[];
    refreshReminders: () => void;
}

export function ReminderList({
    reminders,
    refreshReminders,
}: ReminderListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.length > 0 ? (
                reminders.map((reminder) => (
                    <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        mini={false}
                        refreshReminders={refreshReminders}
                    />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">
                    No reminders found.
                </p>
            )}
        </div>
    );
}

export function MiniReminderList({ reminders }: ReminderListProps) {
    return (
        <>
            {reminders.length > 0 && (
                <div className="list">
                    {reminders.map((reminder) => (
                        <ReminderCard
                            key={reminder.id}
                            reminder={reminder}
                            mini={true}
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            refreshReminders={() => {}}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
