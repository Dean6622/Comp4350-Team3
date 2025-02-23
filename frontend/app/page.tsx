"use client";

import Link from "next/link";

export default function Main() {

    return (
        <div>
            <p className="text-black text-center">
                <Link href="/auth/login" className="text-center hover:underline">
                    Log in?
                </Link>
            </p>
        </div>
    );
}
