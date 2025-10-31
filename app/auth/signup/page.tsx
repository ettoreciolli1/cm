"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/authClient";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);



        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const name = String(fd.get("name") ?? "").trim();

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        // simple client-side password length check
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            // assume auth.client.register(payload) exists
            const res = await authClient.signUp.email({ email, password, name });

            // some clients return an object, others throw on error.
            // handle both patterns:
            if (res?.error) {
                throw new Error(res.error.message || "Sign up failed");
            }

            setSuccess("Account created. Redirecting...");
            // wait a moment to show success then redirect
            setTimeout(() => router.push("/dashboard"), 700);
        } catch (err: any) {
            console.error("sign up error", err);
            setError(err?.message ?? "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Create account</h1>

            <form onSubmit={handleSubmit} className="space-y-4 w-sm">
                <label className="block">
                    <div className="text-sm font-medium">Name</div>
                    <input name="name" className="w-full border rounded px-3 py-2" />
                </label>

                <label className="block">
                    <div className="text-sm font-medium">Email</div>
                    <input name="email" type="email" required className="w-full border rounded px-3 py-2" />
                </label>

                <label className="block">
                    <div className="text-sm font-medium">Password</div>
                    <input name="password" type="password" required className="w-full border rounded px-3 py-2" />
                    <div className="text-xs text-gray-500 mt-1">Minimum 8 characters</div>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded bg-amber-600 text-white disabled:opacity-60"
                >
                    {loading ? "Creating..." : "Create account"}
                </button>

                {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                {success && <div className="text-sm text-green-600 mt-2">{success}</div>}

                <div className="flex justify-between">
                    <Link href={"/auth/login"}>
                        Log in
                    </Link>
                    <Link href={"/auth/reset"}>

                    </Link>
                </div>
            </form>
        </div>
    );
}
