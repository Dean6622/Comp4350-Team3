"use client";

import Layout from "@/components/ui/Layout";
import { useTags } from "@/app/contexts/TagContext";
import { useEffect, useState } from "react";
import { Tag } from "@/app/api/tag";
import TagList from "@/components/ui/Tag/TagList";
import NewTagModal from "@/components/ui/Tag/NewTagModal";
import {useAuth} from "@/app/contexts/AuthContext";

export default function TagPage() {
    const { tags, getTags } = useTags();
    const [data, setData] = useState<Tag[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const { user } = useAuth();

    const fetchTags = async () => {
        const userId = user?.id || localStorage.getItem("userid");
        if (!userId) {
            console.log("User ID not found. Please log in again.");
            return;
        }

        try {
            const success = await getTags(userId);
            if (success) {
                setData(tags);
            }
        } catch (err) {
            console.error(err instanceof Error ? err.message : "tags fetch failed!");
        }
    };

    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setData(tags);
    }, [tags]);

    const toggleForm = () => {
        setIsAdding((prev) => !prev);
    };


    return (
        <Layout title="Tags">
            {/* New Label Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={toggleForm}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-grey-700 transition-all"
                >
                    + New label
                </button>
            </div>

            {isAdding && <NewTagModal toggle={toggleForm} refreshList={fetchTags}/>}

            <TagList tags={data} refreshList={fetchTags}/>
        </Layout>
    );
}
