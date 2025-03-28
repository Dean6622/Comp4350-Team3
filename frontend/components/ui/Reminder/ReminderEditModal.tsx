"use client";

/**
 * Reminder Edit Modal Window
 *
 * Almost identical to Goal Edit Modal
 */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Reminder } from "@/app/api/reminder";
import DatePicker from "react-datepicker";
import { editReminderFromServer } from "@/app/api/reminder";
import { useReminders } from "@/app/contexts/ReminderContext";

export default function ReminderEditModal({
    reminder,
    onClose,
    triggerRect,
}: {
    reminder: Reminder;
    onClose: () => void;
    triggerRect: DOMRect | null;
    refreshReminders: () => void;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [reminderData, setRreminderData] = useState({
        name: reminder?.name || "",
        time: reminder?.time ? new Date(reminder.time) : new Date(),
        text: reminder?.text || "",
        viewed: reminder?.viewed || false,
    });
    const { reminders } = useReminders();

    const [message, setMessage] = useState<{
        text: string;
        type: "error" | "success";
    } | null>(null);

    const window_w = 400;
    const window_h = 300;

    const handleChange = (
        field: keyof typeof reminderData,
        value: string | number | Date
    ) => {
        setRreminderData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (!triggerRect || !contentRef.current) return;

        const content = contentRef.current;
        content.style.visibility = "hidden";

        // calculate destination position
        const finalX = (window.innerWidth - window_w) / 2;
        const finalY = (window.innerHeight - window_h) / 2;

        // initial status
        content.style.transform = `translate(${triggerRect.left}px, ${triggerRect.top}px) scale(0.5)`;
        content.style.width = `${triggerRect.width}px`;
        content.style.height = `${triggerRect.height}px`;
        content.style.opacity = "0";
        content.style.visibility = "visible";

        const animation = content.animate(
            [
                {
                    transform: `translate(${triggerRect.left}px, ${triggerRect.top}px) scale(0.5)`,
                    width: `${triggerRect.width}px`,
                    height: `${triggerRect.height}px`,
                    opacity: "0",
                },
                {
                    transform: `translate(${finalX}px, ${finalY}px)`,
                    width: `${window_w}px`,
                    height: `${window_h}px`,
                    opacity: "1",
                },
            ],
            {
                duration: 450,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            }
        );

        animation.onfinish = () => {
            content.style.transform = `translate(${finalX}px, ${finalY}px)`;
            content.style.width = `${window_w}px`;
            content.style.height = `${window_h}px`;
            content.style.opacity = "1";
        };
    }, [triggerRect]);

    const handleSubmit = async () => {
        if (!reminderData.name || !reminderData.text || !reminderData.time) {
            if (reminderData.time < new Date()) {
                setMessage({
                    text: "New reminder can't be in the past!",
                    type: "error",
                });
                return;
            }
            setMessage({ text: "All fields are required.", type: "error" });
            return;
        }

        setMessage(null);
        setLoading(true);

        try {
            reminder.text = reminderData.text;
            reminder.name = reminderData.name;
            reminder.time = reminderData.time;
            const updatedReminder = await editReminderFromServer(reminder);
            const indexToUpdate = reminders.findIndex(
                (r) => r.id === updatedReminder.id
            );
            reminders[indexToUpdate] = { ...updatedReminder };
            setMessage({
                text: "Reminder saved successfully!",
                type: "success",
            });

            setTimeout(() => {
                setLoading(false);
                onClose();
            }, 500);
        } catch (error) {
            setMessage({
                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to edit reminder",
                type: "error",
            });
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!contentRef.current || !triggerRect) {
            onClose();
            return;
        }

        setLoading(true);
        const content = contentRef.current;
        const finalX = (window.innerWidth - window_w) / 2;
        const finalY = (window.innerHeight - window_h) / 2;

        const animation = content.animate(
            [
                {
                    transform: `translate(${finalX}px, ${finalY}px) scale(1)`,
                    width: `${window_w}px`,
                    height: `${window_h}px`,
                    opacity: "1",
                },
                {
                    transform: `translate(${triggerRect.left}px, ${triggerRect.top}px) scale(0.5)`,
                    width: `${triggerRect.width}px`,
                    height: `${triggerRect.height}px`,
                    opacity: "0",
                },
            ],
            {
                duration: 450,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            }
        );

        animation.onfinish = () => {
            content.style.visibility = "hidden";
            setTimeout(() => {
                setLoading(false);
                onClose();
            }, 50);
        };
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
            <div
                ref={contentRef}
                className={`bg-white p-4 rounded-lg shadow-md absolute 
                max-w-[${window_w}px] 
                max-h-[${window_h}px] 
                origin-center`}
                style={{
                    width: triggerRect?.width + "px",
                    height: triggerRect?.height + "px",
                }}
            >
                <div className="p-2 w-full">
                    <h2 className="text-xl font-bold text-center pt-1">
                        Edit Reminder
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
                                e.target.value === "" ? "" : e.target.value
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

                    {/* Buttons */}
                    <div className="flex justify-end mt-4 gap-2">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                            {loading ? "Closing..." : "Cancel"}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-white ${
                                loading
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <p
                            className={`text-sm text-center mt-1 ${
                                message.type === "error"
                                    ? "text-red-600"
                                    : "text-green-600"
                            }`}
                        >
                            {message.text}
                        </p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
