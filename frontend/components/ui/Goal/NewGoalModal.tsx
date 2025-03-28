"use client";

/**
 * New Goal Modal window
 *
 * window to display when the user create a new goal
 */
import React, { useState } from "react";
import { useGoals } from "@/app/contexts/GoalContext";
import { useAuth } from "@/app/contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X } from "lucide-react";
const categories = ["Saving", "Investment"];

interface NewGoalFormProps {
    toggle: () => void;
    refreshGoals: () => void;
}

export default function NewGoalForm({
    toggle,
    refreshGoals,
}: NewGoalFormProps) {
    const { addGoal } = useGoals();
    const { user } = useAuth();
    const [goalData, setGoalData] = useState({
        name: "",
        currAmount: null as number | null,
        goalAmount: null as number | null,
        category: "Saving",
        time: new Date(),
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "error" | "success";
    } | null>(null);

    // set the data for submission
    const handleChange = (
        field: keyof typeof goalData,
        value: string | number | Date | null
    ) => {
        setGoalData((prev) => ({
            ...prev,
            [field]: value === "" ? null : value,
        }));
    };

    const handleSubmit = async () => {
        setMessage(null);

        if (
            !goalData.name ||
            !goalData.time ||
            goalData.currAmount === null ||
            goalData.goalAmount === null
        ) {
            setMessage({ text: "All fields are required.", type: "error" });
            return;
        }

        if (goalData.currAmount > goalData.goalAmount) {
            setMessage({ text: "Goal is less than saving!", type: "error" });
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

            const formattedDate = goalData.time.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            await addGoal(
                userId,
                goalData.name,
                formattedDate,
                goalData.currAmount,
                goalData.goalAmount,
                goalData.category
            );
            setMessage({ text: "Goal added successfully!", type: "success" });

            setTimeout(() => {
                setMessage(null);
                toggle();
                refreshGoals();
            }, 500);
        } catch (error) {
            setMessage({
                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to add goal",
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
                Create New Goal
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
                value={goalData.currAmount ?? ""}
                onChange={(e) =>
                    handleChange(
                        "currAmount",
                        e.target.value === "" ? null : Number(e.target.value)
                    )
                }
                className="w-full border border-gray-300 p-2 rounded mb-2"
            />

            {/* Goal Amount */}
            <input
                type="number"
                placeholder="Goal Amount"
                value={goalData.goalAmount ?? ""}
                onChange={(e) =>
                    handleChange(
                        "goalAmount",
                        e.target.value === "" ? null : Number(e.target.value)
                    )
                }
                className="w-full border border-gray-300 p-2 rounded mb-2"
            />

            {/* Category Dropdown */}
            <select
                value={goalData.category}
                onChange={(e) => handleChange("category", e.target.value)}
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
