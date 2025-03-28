"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NotificationList from "./Reminder/NotificationList";

/**
 * Layout for other pages
 */
interface LayoutProps {
    title: string;
    children: React.ReactNode;
    middleComponent?: React.ReactNode;
}

export default function Layout({
    title,
    children,
    middleComponent,
}: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`bg-gray-900 transition-all duration-300 ${
                    isSidebarOpen ? "w-64" : "w-16"
                }`}
            >
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 transition-all duration-300">
                <Navbar title={title} middleComponent={middleComponent} />
                <main className="p-4 pt-6">{children}</main>
            </div>

            {/**Notification List */}
            <NotificationList />
        </div>
    );
}
