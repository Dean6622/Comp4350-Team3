import { Reminder } from "@/app/api/reminder";
import { MiniReminderList } from "./ReminderList";
import { useReminders } from "@/app/contexts/ReminderContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { useState, useEffect } from "react";
import { NotificationButton } from "./Button";

const SEC_PER_DAY = 86400;

export default function NotificationList() {
    const { reminders, getReminders } = useReminders();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<Reminder[]>([]);

    const selectUpcomingReminders = (rawReminders: Reminder[]) => {
        const now = new Date();
        return rawReminders.filter(
            (r) =>
                Math.abs(now.getTime() - new Date(r.time).getTime()) / 1000 <
                    SEC_PER_DAY * 2 && !r.viewed
        );
    };

    const getDataOnRender = async () => {
        console.log("get data run");
        try {
            const success = await getReminders(
                user?.id || (localStorage.getItem("userid") as string)
            );

            if (success) {
                setData(selectUpcomingReminders(reminders));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("Reminders fetch failed!");
            }
        }
    };

    useEffect(() => {
        if (reminders.length <= 0) getDataOnRender();
        else setData(selectUpcomingReminders(reminders));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reminders]);

    return (
        <div className="absolute fixed top-0 right-0 p-4">
            <NotificationButton
                onClickFunc={() => setOpen(!open)}
                empty={data.length <= 0}
            />
            {open && data.length > 0 ? (
                <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-64 p-4">
                    {
                        <MiniReminderList
                            reminders={data}
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            refreshReminders={() => {}}
                        />
                    }
                </div>
            ) : null}
        </div>
    );
}
