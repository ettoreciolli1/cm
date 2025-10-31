"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/app/lib/authClient";
import { useRouter } from "next/navigation";

export default function ProfileCardClient() {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    useEffect(() => {
        async function load() {
            try {
                const s = await authClient.getSession?.();
                setUser(s?.data?.user ?? null);
            } catch (err) {
                console.error("getSession error", err);
                setError("Failed to load session");
            }
        }
        load();
    }, []);

    const handleSignOut = async () => {

        setLoading(true);
        setError(null);
        try {
            await authClient.signOut?.();
            setUser(null);
            router.push("/");
        } catch (err: any) {
            console.error("signOut error", err);
            setError(err?.message ?? "Sign out failed");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-sm text-red-600">{error}</div>;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <a href="/auth/sign-in" className="text-sm text-indigo-600 hover:underline">Sign in</a>
                <a href="/auth/sign-up" className="ml-2 text-sm text-amber-600 hover:underline">Sign up</a>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            {user.image ? (
                <img src={user.image} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center">
                    {user.name?.[0] ?? "U"}
                </div>
            )}

            <div className="text-sm">
                <div className="font-medium">{user.name ?? user.email}</div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleSignOut}
                        className="text-xs text-red-600 hover:underline disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </div>
        </div>
    );
}
