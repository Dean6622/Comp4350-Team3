"use client";

import { useState } from "react";
import { AuthInput } from "@/components/ui/Input";
import { AuthButton} from "@/components/ui/Button";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const {login} = useAuth();
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await login(username, password);
            setMessage(response.message);
            router.push("/transactions");

        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Failed to log in");
            }
        }
    };

    return (
        <div className="relative w-screen h-screen bg-gradient-to-r from-gray-50 to-gray-400 flex items-center justify-center">
            {/* Floating Block */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl grid grid-cols-2">
                {/* Left Panel: Image */}
                <div className="rounded-l-lg overflow-hidden flex items-center justify-center bg-gray-100">
                    <Image
                        src="/Signup.png"
                        alt="login Illustration"
                        className="object-contain"
                        width={350}
                        height={350}
                    />
                </div>

                {/* Right Panel: Form */}
                <div className="p-8 flex flex-col justify-center space-y-8">
                    <h1 className="text-4xl font-bold text-black text-left">
                        Log in
                    </h1>

                    {/* Form */}
                    <div className="space-y-6">
                        <AuthInput
                            type="text"
                            placeholder="Name"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-purple-500"
                        />
                        <AuthInput
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <AuthButton
                        onClick={handleLogin}
                    >
                        Log In
                    </AuthButton>

                    <div className="relative space-y-5">
                        <p className="text-sm text-gray-500 text-center">
                            {"Don't have an account? "}
                            <Link href="/auth/signup" className="text-gray-900 hover:underline">
                                Sign Up
                            </Link>
                        </p>

                        {/* Forgot Password */}
                        <p className="text-sm text-gray-500 text-center">
                            <Link href="/auth/reset-password" className="text-gray-700 hover:underline">
                                Forgot password?
                            </Link>
                        </p>
                    </div>

                    {/* Warning message block */}
                    <div className="space-y-0">
                        <p className="text-customDarkRed mb-0">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
