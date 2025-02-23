"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    login,
    logout,
    signup,
    resetPassword,
    User,
} from "@/app/api/auth";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<{ message: string }>;
    signup: (
        username: string,
        password: string
    ) => Promise<{ message: string }>;
    logout: () => Promise<void>;
    resetPassword: (
        username: string,
        password: string
    ) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // useEffect(() => {
    //     // check user state
    //     getUser().then((user) => setUser(user));
    // }, []);

    // get user info from localStorage (after refreshed page)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = async (username: string, password: string) => {
        const result = await login(username, password);
        // const user = await getUser();
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user)); // storage user info into localStorage
        return { message: result.message };
    };

    const handleSignup = async (username: string, password: string) => {
        return await signup(username, password);
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
    };

    const handleResetPassword = async (username: string, password: string) => {
        return await resetPassword(username, password);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login: handleLogin,
                signup: handleSignup,
                logout: handleLogout,
                resetPassword: handleResetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
