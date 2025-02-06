"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import {getUser, login, logout, signup, User} from "@/app/api/auth";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string) => Promise<{ message: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // check user state
        getUser().then((user) => setUser(user));
    }, []);

    const handleLogin = async (username: string, password: string) => {
        await login(username, password);
        const user = await getUser();
        setUser(user);
    };

    const handleSignup = async (username: string, password: string) => {
        return await signup(username, password);
    }

    const handleLogout = async () =>{
        await logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login: handleLogin,
                signup: handleSignup,
                logout: handleLogout,
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