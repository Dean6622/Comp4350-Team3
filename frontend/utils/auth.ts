export interface User {
    id: number;
    username: string;
}

export async function login(username: string, password: string): Promise<void> {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL); //test API
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
    });
}

export async function getUser(): Promise<User | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) return null;
    return res.json();
}

export async function logout(): Promise<void> {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: "POST",
        credentials: "include"
    });
}

export async function signup(username: string, password: string): Promise<{ message: string }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to sign up");
    }

    return res.json();
}


