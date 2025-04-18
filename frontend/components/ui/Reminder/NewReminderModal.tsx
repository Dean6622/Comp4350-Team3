"use client";

/**
 * New Reminder Modal Window
 *
 * Allows a user to create a new reminder by specifying a name, message text,
 * and a date-time using a date picker. Includes validation and feedback.
 */

import React, { useState } from "react";
import { useReminders } from "@/app/contexts/ReminderContext";
import { useAuth } from "@/app/contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X } from "lucide-react";

interface NewReminderFormProps {
    toggle: () => void;              // Function to close the modal
    refreshReminders: () => void;    // Callback to reload reminders after submission
}

// 🚫 [Note] You have a duplicate interface declaration — the second one should be removed
// ✅ I’ll assume you meant to keep just one.

export default function NewReminderForm({
                                            toggle,
                                            refreshReminders,
                                        }: NewReminderFormProps) {
    const { addReminder } = useReminders();
    const { user } = useAuth();

    // Local state for form input fields
    const [reminderData, setReminderData] = useState({
        userId: "",
        name: "",
        text: "",
        time: new Date(),
        viewed: false,
    });

    // UI feedback states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "error" | "success";
    } | null>(null);

    /**
     * Updates a specific field in reminderData
     */
    const handleChange = (
        field: keyof typeof reminderData,
        value: string | number | Date | null
    ) => {
        setReminderData((prev) => ({
            ...prev,
            [field]: value === "" ? null : value,
        }));
    };

    /**
     * Handles form submission, including validation and server call
     */
    const handleSubmit = async () => {
        setMessage(null);

        // Validate required fields
        if (
            !reminderData.name ||
            reminderData.text === null ||
            reminderData.time === null
        ) {
            setMessage({ text: "All fields are required.", type: "error" });
            return;
        }

        // Prevent setting reminders in the past
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

            // Format time for the server (can be replaced with ISO string if needed)
            const formattedTime = reminderData.time.toLocaleTimeString("en-US", {
                minute: "2-digit",
                hour: "2-digit",
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            // Submit the reminder to the server
            await addReminder(
                userId,
                reminderData.name,
                formattedTime,
                reminderData.text
            );

            // Show success message and close modal
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
            className="fixed right-4 top-4 bg-black p-4 rounded-lg shadow-lg
                       border border-gray-300 w-96 z-50 pop-in-animation"
        >
            {/* Close (X) Button */}
            <button
                onClick={toggle}
                className="absolute right-2 top-2 text-customReminderGold hover:text-yellow-200
                           rounded-full p-1 shadow-sm z-10"
            >
                <X size={20} />
            </button>

            {/* Modal Title */}
            <h2 className="text-xl font-bold mb-4 text-center pt-1 text-customReminderGold">
                Create New Reminder
            </h2>

            {/* Input: Reminder Name */}
            <input
                type="text"
                placeholder="Reminder Name"
                value={reminderData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-transparent border border-gray-300 p-2 rounded mb-2 text-customReminderGold"
            />

            {/* Input: Reminder Text */}
            <input
                type="text"
                placeholder="Text"
                value={reminderData.text ?? ""}
                onChange={(e) =>
                    handleChange("text", e.target.value === "" ? null : e.target.value)
                }
                className="w-full bg-transparent border border-gray-300 p-2 rounded mb-2 text-customReminderGold"
            />

            {/* Input: Date & Time Picker */}
            <DatePicker
                selected={reminderData.time}
                onChange={(date: Date | null) =>
                    handleChange("time", date || new Date())
                }
                showTimeSelect
                dateFormat="yyyy-MM-dd hh:mm"
                timeFormat="HH:mm"
                className="w-full bg-transparent border border-gray-300 p-2 rounded mb-2 text-customReminderGold"
                showPopperArrow={false}
            />

            {/* Error/Success Message */}
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

            {/* Action Buttons */}
            <div className="flex justify-end mt-4 gap-2">
                <button
                    onClick={toggle}
                    className="px-4 py-2 rounded-md hover:bg-red-400"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white  ${
                        loading
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-transparent hover:bg-green-600"
                    }`}
                >
                    {loading ? "Creating..." : "Create"}
                </button>
            </div>
        </div>
    );
}
