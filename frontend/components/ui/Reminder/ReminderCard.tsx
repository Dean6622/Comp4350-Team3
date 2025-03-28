"use client";

/**
 * Reminder Card
 *
 * Similar to goal card
 */
import React, { useEffect, useRef, useState } from "react";
import { Reminder, editReminderFromServer } from "@/app/api/reminder";
import { CheckButton } from "../Button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { formatTimeDifference } from "@/lib/utils";
import { useReminders } from "@/app/contexts/ReminderContext";
import ReminderEditModal from "@/components/ui/Reminder/ReminderEditModal";

interface ReminderCardProps {
    reminder: Reminder;
    mini?: boolean;
    refreshReminders: () => void;
}

export default function ReminderCard({
    reminder,
    mini,
    refreshReminders,
}: ReminderCardProps) {
    const [viewed, setViewed] = useState(reminder.viewed);
    const { reminders } = useReminders();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { deleteReminder } = useReminders();
    const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // close the modal when other place is clicked
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${reminder.name}"?`)) {
            await deleteReminder(reminder.id);
            refreshReminders();
            setShowMenu(false);
        }
    };

    const handleEdit = () => {
        if (cardRef.current) {
            setTriggerRect(cardRef.current.getBoundingClientRect());
            setIsEditing(true);
        }
    };

    // when the checke button is clicked, flip the viewed field of a reminder
    const flipViewed = async () => {
        const tempViewed = viewed;
        setViewed(!tempViewed);
        // a quick modification call to the server, no response expected
        const updatedReminder = await editReminderFromServer({
            ...reminder,
            viewed: !tempViewed,
        });
        const indexToUpdate = reminders.findIndex(
            (r) => r.id === updatedReminder.id
        );
        reminders[indexToUpdate] = { ...updatedReminder };
    };

    // if the card is not used for notification list, display the full information
    if (!mini) {
        return (
            <div
                ref={cardRef}
                className="bg-white p-4 rounded-lg shadow-md relative border border-gray-200"
            >
                <div className="bg-white p-4 rounded-lg shadow-md relative border border-gray-200">
                    {/* Reminder Name */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <CheckButton
                                checked={viewed}
                                onClickFunc={flipViewed}
                            />
                            <h2 className="text-lg font-semibold italic">
                                {reminder.name}
                            </h2>
                        </div>
                        <button
                            ref={buttonRef}
                            onClick={() => setShowMenu(!showMenu)}
                            className="cursor-pointer text-gray-500 hover:text-black"
                        >
                            <MoreHorizontal className="cursor-pointer text-gray-500 hover:text-black" />
                        </button>
                        {showMenu && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-8 bg-white border border-gray-200
                        rounded-lg shadow-lg w-32 z-50 mt-2"
                            >
                                <button
                                    onClick={() => {
                                        handleEdit();
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        handleDelete();
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}

                        {isEditing && (
                            <ReminderEditModal
                                reminder={reminder}
                                onClose={() => setIsEditing(false)}
                                triggerRect={triggerRect}
                                refreshReminders={refreshReminders}
                            />
                        )}
                    </div>

                    {/* Divider Line */}
                    <div className="border-t border-gray-300 my-6"></div>

                    {/* Reminder Details */}
                    <div className="text-base mt-7 text-gray-500">
                        <div className="flex justify-between">
                            <span className="font-normal font-mono text-black">
                                {new Date(reminder.time).toLocaleTimeString(
                                    "en-US",
                                    {
                                        minute: "2-digit",
                                        hour: "2-digit",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </span>
                        </div>
                        <div className="text-sm">
                            <div className="flex justify-between mt-2">
                                <span className="font-light font-serif">
                                    Note: {reminder.text}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        // otherwise, only display the name and its time from now
        return (
            <div className="bg-white p-3 rounded-md shadow-sm relative border border-gray-200 w-48">
                {/* Reminder Name */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                        <CheckButton
                            checked={viewed}
                            onClickFunc={flipViewed}
                        />
                        <h2 className="text-base font-semibold italic">
                            {reminder.name}
                        </h2>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-gray-300 my-3"></div>

                {/* Reminder Details */}
                <div className="text-sm text-gray-500">
                    <div className="flex justify-between">
                        <span className="font-mono text-black">
                            {formatTimeDifference(new Date(reminder.time))}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
