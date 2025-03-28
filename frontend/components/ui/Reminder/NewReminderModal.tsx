"use client";

/**
 * New Reminder Modal Window
 */
import React, { useState } from "react";
import { useReminders } from "@/app/contexts/ReminderContext";
import { useAuth } from "@/app/contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X } from "lucide-react";

interface NewReminderFormProps {
    toggle: () => void;
    refreshReminders: () => void;
}

interface NewReminderFormProps {
    toggle: () => void;
    refreshReminders: () => void;
}

export default function NewReminderForm({
    toggle,
    refreshReminders,
}: NewReminderFormProps) {
    const { addReminder } = useReminders();
    const { user } = useAuth();
    const [reminderData, setReminderData] = useState({
        userId: "",
        name: "",
        text: "",
        time: new Date(),
        viewed: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "error" | "success";
    } | null>(null);

    const handleChange = (
        field: keyof typeof reminderData,
        value: string | number | Date | null
    ) => {
        setReminderData((prev) => ({
            ...prev,
            [field]: value === "" ? null : value,
        }));
    };

    const handleSubmit = async () => {
        setMessage(null);

        if (
            !reminderData.name ||
            reminderData.text === null ||
            reminderData.time === null
        ) {
            setMessage({ text: "All fields are required.", type: "error" });
            return;
        }

        if (reminderData.time < new Date()) {
            setMessage({
                text: "New reminder can't be in the past!",
                type: "error",
            });
            return;
        }

        const userId = user?.id || localStorage.getItem("userid");
        if (!userId) {
            setMessage({
                text: "User ID not found. Please log in again.",
                type: "error",
            });
            return;
        }

        try {
            setLoading(true);
            const formattedTime = reminderData.time.toLocaleTimeString(
                "en-US",
                {
                    minute: "2-digit",
                    hour: "2-digit",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }
            );

            await addReminder(
                userId,
                reminderData.name,
                formattedTime,
                reminderData.text
            );
            setMessage({
                text: "Reminder added successfully!",
                type: "success",
            });

            setTimeout(() => {
                setMessage(null);
                toggle();
                refreshReminders();
            }, 500);
        } catch (error) {
            setMessage({
                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to add reminder",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed right-4 top-4 bg-white p-4 rounded-lg shadow-lg
        border border-gray-300 w-96 z-50 pop-in-animation"
        >
            <button
                onClick={toggle}
                className="absolute -right-2 -top-2 text-gray-600 hover:text-black bg-white
                rounded-full p-1 shadow-sm border border-gray-200 hover:border-gray-300 z-10"
            >
                <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-center pt-1">
                Create New Reminder
            </h2>

            {/* Reminder Name */}
            <input
                type="text"
                placeholder="Reminder Name"
                value={reminderData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded mb-2"
            />

            {/* Reminder Text */}
            <input
                type="text"
                placeholder="Text"
                value={reminderData.text ?? ""}
                onChange={(e) =>
                    handleChange(
                        "text",
                        e.target.value === "" ? null : e.target.value
                    )
                }
                className="w-full border border-gray-300 p-2 rounded mb-2"
            />

            {/* Date Picker */}
            <DatePicker
                selected={reminderData.time}
                onChange={(date: Date | null) =>
                    handleChange("time", date || new Date())
                }
                showTimeSelect
                dateFormat="yyyy-MM-dd hh:mm"
                timeFormat="HH:mm"
                className="w-full border border-gray-300 p-2 rounded mb-2"
                showPopperArrow={false}
            />

            {/* Message Display */}
            {message && (
                <p
                    className={`text-sm text-center mt-2 ${
                        message.type === "error"
                            ? "text-red-600"
                            : "text-green-600"
                    }`}
                >
                    {message.text}
                </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end mt-4 gap-2">
                <button
                    onClick={toggle}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white ${
                        loading
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-black hover:bg-gray-800"
                    }`}
                >
                    {loading ? "Creating..." : "Create"}
                </button>
            </div>
        </div>
    );
}
