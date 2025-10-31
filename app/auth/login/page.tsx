"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/authClient";
import Link from "next/link";

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");

        if (!email || !password) {
            setError("Email & password required.");
            return;
        }

        try {
            setLoading(true);

            // assume auth.client.signIn({ email, password }) exists
            const res = await authClient.signIn.email({ email, password });

            // handle both return styles
            if (res?.error) {
                throw new Error(res.error.message || "Sign in failed");
            }

            // success — redirect
            router.push("/dashboard");
        } catch (err: any) {
            console.error("signin error", err);
            setError(err?.message ?? "Sign in failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Log in</h1>

            <form onSubmit={handleSubmit} className="space-y-4 w-sm">
                <label className="block">
                    <div className="text-sm font-medium">Email</div>
                    <input name="email" type="email" required className="w-full border rounded px-3 py-2" />
                </label>

                <label className="block">
                    <div className="text-sm font-medium">Password</div>
                    <input name="password" type="password" required className="w-full border rounded px-3 py-2" />
                </label>

                <button type="submit" disabled={loading} className="w-full py-2 rounded bg-indigo-600 text-white disabled:opacity-60">
                    {loading ? "Signing in..." : "Sign in"}
                </button>
                <div className="flex justify-between">
                    <Link href={"/auth/signup"}>
                        Sign up
                    </Link>
                    <Link href={"/auth/reset"}>
                        Reset password
                    </Link>
                </div>


                {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            </form>
        </div>
    );
}
