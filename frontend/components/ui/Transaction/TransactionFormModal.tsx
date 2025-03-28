"use client";

/**
 * Transaction Form Modal
 *
 * Used for add/edit a transaction
 */
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X } from "lucide-react";
import { useTags } from "@/app/contexts/TagContext";
import {
    addTransactionsToServer,
    editTransactionsOnServer,
    Transaction,
} from "@/app/api/transac";
import {Tag} from "@/app/api/tag";
const types = ["Saving", "Spending"];

interface TransactionFormModalProps {
    isOpen: boolean;
    toggle: () => void;
    refreshTransactions: () => void;
    mode: "add" | "edit";
    existingTransaction?: Transaction | null;
}

export default function TransactionFormModal({
    isOpen,
    toggle,
    refreshTransactions,
    mode,
    existingTransaction,
}: TransactionFormModalProps) {
    const { tags, getTags } = useTags();
    const [transacData, setTransacData] = useState({
        name: "",
        amount: null as number | null,
        time: new Date(),
        type: "Saving",
        tags: [] as Tag[],
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "error" | "success";
    } | null>(null);

    const [headLine, setHeadLine] = useState<string>("");

    const cleanTransacData = () => {
        transacData.name = "";
        transacData.amount = null;
        transacData.time = new Date();
        transacData.type = "Saving";
        transacData.tags = [];
    };

    const handleChange = (
        field: keyof typeof transacData,
        value: string | number | Date | null
    ) => {
        setTransacData((prev) => ({
            ...prev,
            [field]: value === "" ? null : value,
        }));
    };

    useEffect(() => {
        if (mode === "edit" && existingTransaction) {
            transacData.name = existingTransaction.name;
            transacData.amount = existingTransaction.amount;
            transacData.time = new Date(existingTransaction.date);
            transacData.type = existingTransaction.type;
            transacData.tags = existingTransaction.tags || [];
            setHeadLine("Edit Transaction");
        } else {
            cleanTransacData();
            setHeadLine("Add Transaction");
        }
    }, [mode, existingTransaction]);


    useEffect(() => {
        const fetchTags = async () => {
            const userId = localStorage.getItem("userid");
            if (userId) {
                await getTags(userId);
            }
        };

        if (isOpen) {
            fetchTags();
        }
    }, [isOpen, getTags]);

    const handleTagSelection = (tag: Tag) => {
        setTransacData((prev) => {
            const isTagSelected = prev.tags.some((t) => t.id === tag.id);

            const newTags = isTagSelected
                ? prev.tags.filter((t) => t.id !== tag.id)
                : [...prev.tags, tag];

            return { ...prev, tags: newTags };
        });
    };

    const handleSubmit = async () => {
        setMessage(null);

        if (
            !transacData.name ||
            !transacData.amount ||
            !transacData.type
        ) {
            setMessage({ text: "All fields are required.", type: "error" });
            return;
        }

        const userid = localStorage.getItem("userid");
        if (!userid) {
            setMessage({
                text: "User ID not found, please log in again.",
                type: "error",
            });
            return;
        }

        try {
            setLoading(true);
            const formattedDate = transacData.time.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            if (mode === "add") {
                await addTransactionsToServer(
                    userid,
                    transacData.name,
                    formattedDate,
                    transacData.amount,
                    transacData.type,
                    transacData.tags,
                );
                setMessage({
                    text: "Transaction added successfully!",
                    type: "success",
                });
            } else if (mode === "edit" && existingTransaction) {
                await editTransactionsOnServer(
                    existingTransaction.id,
                    transacData.name,
                    formattedDate,
                    transacData.amount,
                    transacData.type,
                    transacData.tags,
                );
                setMessage({
                    text: "Transaction updated successfully!",
                    type: "success",
                });
            }

            setTimeout(() => {
                setMessage(null);
                toggle();
                cleanTransacData();
                refreshTransactions();
            }, 500);
        } catch (error) {
            setMessage({
                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to process transaction",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity ${
                isOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
        >
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-96">
                {/* Close Button (X) */}
                <button
                    onClick={toggle}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                    <X size={20} />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold mb-4 text-center">
                    {headLine}
                </h2>

                {/* Transaction name */}
                <input
                    type="text"
                    placeholder="Transaction Name"
                    value={transacData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                />

                {/* Amount Input */}
                <input
                    type="number"
                    placeholder="Amount"
                    value={transacData.amount ?? ""}
                    onChange={(e) =>
                        handleChange(
                            "amount",
                            e.target.value === ""
                                ? null
                                : Number(e.target.value)
                        )
                    }
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                />

                {/* Type Dropdown */}
                <select
                    value={transacData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded mb-4 bg-white"
                >
                    {types.map((cur) => (
                        <option key={cur} value={cur}>
                            {cur}
                        </option>
                    ))}
                </select>

                {/* Date Picker */}
                <DatePicker
                    selected={transacData.time}
                    onChange={(date: Date | null) =>
                        handleChange("time", date || new Date())
                    }
                    dateFormat="yyyy-MM-dd"
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                    showPopperArrow={false}
                />

                {/* Tags Selection */}
                <div className="mb-4">
                    <label className="font-bold mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => {
                            const isTagSelected = transacData.tags.some((t) => t.id === tag.id);
                            return (
                                <div
                                    key={tag.id}
                                    className={`flex items-center gap-1 p-1 rounded ${isTagSelected ? "bg-blue-100" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isTagSelected}
                                        onChange={() => handleTagSelection(tag)}
                                        className="mr-1 cursor-pointer"
                                    />
                                    <span
                                        className="px-2 py-1 text-sm rounded-full cursor-pointer"
                                        style={{ backgroundColor: tag.color, color: "white" }}
                                        onClick={() => handleTagSelection(tag)}
                                    >
                                        {tag.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : "Save"}
                </button>

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
            </div>
        </div>
    );
}
