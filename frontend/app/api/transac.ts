import { Tag } from "@/app/api/tag";

export interface Transaction {
    id: string,
    date: Date,
    amount: number,
    currency: string,
    type: string,
    name: string,
    tags: Tag[],
}

export async function getTransactionsFromServer(userId: string): Promise<Transaction[]> {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/${userId}`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to fetch transactions");
    }

    const data = await res.json();
    return data || [];
}

export async function addTransactionsToServer(
    userId: string,
    name: string,
    date: string,
    amount: number,
    type: string,
    tags: Tag[]): Promise<{message: string}> {

    const currency = "CAD";
    const tagIds = tags.map(tag => tag.id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, date, amount, type, currency, tags: tagIds }),
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to add transaction");
    }
    return res.json();
}

export async function editTransactionsOnServer(
    transactionId: string,
    name: string,
    date: string,
    amount: number,
    type: string,
    tags: Tag[]): Promise< {message:string}> {

    const currency = "CAD";
    const tagIds = tags.map(tag => tag.id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/${transactionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, date, amount, type, currency, tags: tagIds}),
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to edit transaction");
    }
    return res.json();
}

export async function deleteTransactionFromServer(transactionId: string): Promise<{ message: string }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/${transactionId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Failed to delete transaction");
    }
    return res.json();
}
