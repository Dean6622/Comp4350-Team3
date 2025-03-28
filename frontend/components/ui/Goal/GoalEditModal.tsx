"use client";

/**
 * Goal Edit Modal Window
 *
 * The poped up window when user click edit a goal
 */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Goal } from "@/app/api/goal";
import DatePicker from "react-datepicker";
import { editGoalToServer } from "@/app/api/goal";
const categories = ["Saving", "Investment"];

export default function GoalEditModal({
    goal,
    onClose,
    triggerRect,
    refreshGoals,
}: {
    goal: Goal;
    onClose: () => void;
    triggerRect: DOMRect | null;
    refreshGoals: () => void;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [goalData, setGoalData] = useState({
        name: goal?.name || "",
        currAmount: goal?.currAmount || 0,
        goalAmount: goal?.goalAmount || 0,
        category: goal?.category || categories[0],
        time: goal?.time ? new Date(goal.time) : new Date(),
    });

    const [message, setMessage] = useState<{
        text: string;
        type: "error" | "success";
    } | null>(null);

    const window_w = 400;
    const window_h = 400;

    // function to update the stored data to submit
    const handleChange = (
        field: keyof typeof goalData,
        value: string | number | Date
    ) => {
        setGoalData((prev) => ({ ...prev, [field]: value }));
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

        // the window should pop up from the button to the specific location
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
        if (!goalData.name || !goalData.currAmount || !goalData.goalAmount) {
            let message = "All fields are required.";
            if (goalData.currAmount === 0 || goalData.goalAmount === 0) {
                message = "Goal or Saved cannot be 0";
            }
            setMessage({ text: message, type: "error" });
            return;
        }

        if (goalData.currAmount > goalData.goalAmount) {
            setMessage({ text: "Goal is less than saving!", type: "error" });
            return;
        }
        setMessage(null);
        setLoading(true);

        const formattedDate = goalData.time.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        try {
            await editGoalToServer(
                goal.id,
                goalData.name,
                formattedDate,
                Number(goalData.currAmount),
                Number(goalData.goalAmount),
                goalData.category
            );

            setMessage({ text: "Goal saved successfully!", type: "success" });

            setTimeout(() => {
                setLoading(false);
                refreshGoals();
                onClose();
            }, 500);
        } catch (error) {
            setMessage({
                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to edit goal",
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
                        Edit Goal
                    </h2>

                    {/* Goal Name */}
                    <input
                        type="text"
                        placeholder="Goal Name"
                        value={goalData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded mb-2"
                    />

                    {/* Current Amount */}
                    <input
                        type="number"
                        placeholder="Current Amount"
                        value={goalData.currAmount}
                        onChange={(e) =>
                            handleChange(
                                "currAmount",
                                e.target.value ? Number(e.target.value) : ""
                            )
                        }
                        className="w-full border border-gray-300 p-2 rounded mb-2"
                    />

                    {/* Goal Amount */}
                    <input
                        type="number"
                        placeholder="Goal Amount"
                        value={goalData.goalAmount}
                        onChange={(e) =>
                            handleChange(
                                "goalAmount",
                                e.target.value ? Number(e.target.value) : ""
                            )
                        }
                        className="w-full border border-gray-300 p-2 rounded mb-2"
                    />

                    {/* Category Dropdown */}
                    <select
                        value={goalData.category}
                        onChange={(e) =>
                            handleChange("category", e.target.value)
                        }
                        className="w-full border border-gray-300 p-2 rounded mb-4 bg-white"
                    >
                        {categories.map((cur) => (
                            <option key={cur} value={cur}>
                                {cur}
                            </option>
                        ))}
                    </select>

                    {/* Date Picker */}
                    <DatePicker
                        selected={goalData.time}
                        onChange={(date: Date | null) =>
                            handleChange("time", date || new Date())
                        }
                        dateFormat="yyyy-MM-dd"
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
