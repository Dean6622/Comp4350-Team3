export interface User {
    id: string;
    username: string;
    balance: number;
}

//API hook for login request
export async function login(username: string, password: string): Promise<{ user: User, message: string }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to log in");
    }
    return res.json();
}

//API hook for get user
export async function getUser(): Promise<User | null> {
    const username = localStorage.getItem("username");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${username}`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) return null;
    return res.json();
}

//API hook for log out request
export async function logout(): Promise<void> {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login/logout`, {
        method: "POST",
        credentials: "include"
    });
}

//API hook for sign up request
export async function signup(username: string, password: string, balance: number): Promise<{ message: string }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, balance }),
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to sign up");
    }
    return res.json();
}

//API hook for reset password request
export async function resetPassword(username: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to reset new password");
    }
    return res.json();
}
