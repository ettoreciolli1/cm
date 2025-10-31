"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

type Props = {
    cafe?: { id?: number; name?: string } | null;
    loading?: boolean;
    error?: any;
};

export default function MenuHeader({ cafe, loading, error }: Props) {
    return (
        <header className="flex items-center justify-between gap-4">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-extrabold tracking-tight text-gray-900"
                >
                    {loading ? "Loading…" : cafe?.name ? `${cafe.name} — Menu` : "Menu"}
                </motion.h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage the items on your menu. Add, edit, or view ingredients & suppliers.
                </p>
                {error && (
                    <div className="mt-2 text-sm text-red-600">Error: {(error as any)?.message}</div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button label="Import CSV" onClick={() => alert("Import not implemented")} />
                <Button label="Export" onClick={() => alert("Export not implemented")} />
            </div>
        </header>
    );
}
