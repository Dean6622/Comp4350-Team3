"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import {addTagToServer} from "@/app/api/tag";
import {useAuth} from "@/app/contexts/AuthContext";

interface NewTagModalProps {
    toggle: () => void;
    refreshList: () => void;
}

export default function NewTagModal({toggle, refreshList}: NewTagModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#434858");
    const { user } = useAuth();


    // random generate color
    const generateRandomColor = () => {
        const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        setColor(randomColor);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        const userId = user?.id || localStorage.getItem("userid");
        if (!userId) {
            console.log("User ID not found. Please log in again.");
            return;
        }
        try{
            await addTagToServer(userId, name, color, description);
            refreshList();
        }
        catch (error) {
            console.error(error);
        } finally {
            toggle();
        }
    };

    return (
        <div className="bg-gray-100 p-4 mb-5 rounded-md border border-gray-300 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
                <span
                    className="px-3 py-1 text-white rounded-full text-sm font-medium inline-block"
                    style={{backgroundColor: color}}
                >
                    {name.trim() === "" ? "Label preview" : name.trim()}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Label Name */}
                <div className="flex flex-col justify-center mr-4">
                    <label className="block text-gray-700 font-semibold mb-1">Label name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-72 h-10 border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200"
                        placeholder="Label name"
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col justify-center mr-4">
                    <label className="block text-gray-700 font-semibold mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-80 h-10 border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200"
                        placeholder="Description (optional)"
                    />
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-2 mt-7">
                    <button
                        onClick={generateRandomColor}
                        className="h-10 w-10 flex items-center justify-center rounded text-white"
                        style={{backgroundColor: color}}
                    >
                        <RefreshCw size={16}/>
                    </button>
                    <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-24 border border-gray-300 p-2 rounded-md text-center"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-5 ml-auto">
                    <button
                        onClick={toggle}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
                        disabled={!name.trim()}
                    >
                        Create label
                    </button>
                </div>
            </div>
        </div>
    );
}
