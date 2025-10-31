// components/HeroClient.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";

export default function HeroClient() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-extrabold leading-tight"
                >
                    Run your cafe with less stress, and more profit.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mt-4 text-gray-600 max-w-2xl"
                >
                    Inventory, POS, staff scheduling and loyalty — all in one clean dashboard made for busy
                    cafe owners. Start a free trial and see a difference in your first week.
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                    <div className="mt-6 flex gap-3">
                        <Link
                            href="/auth/sign-up"
                            className="rounded-md bg-amber-600 px-5 py-3 text-white font-semibold hover:bg-amber-700"
                        >
                            Start free trial
                        </Link>
                        <Link
                            href="/demo"
                            className="rounded-md border px-5 py-3 text-gray-700 hover:bg-gray-100"
                        >
                            Book a demo
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-6 text-sm text-gray-500"
                >
                    <span className="inline-block mr-2">🚀</span> No credit card required — cancel anytime.
                </motion.div>
            </div>

            {/* Illustration / tiny product preview */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full md:w-1/2 bg-white rounded-xl shadow-lg p-4"
            >
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-xs text-gray-500">Today</div>
                            <div className="text-sm font-semibold">Downtown Cafe — Terminal 1</div>
                        </div>
                        <div className="text-sm text-gray-600">Open</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <MiniCard label="Sales" value="$1,284" />
                        <MiniCard label="Orders" value="48" />
                        <MiniCard label="Top item" value="Iced Oat Latte" />
                        <MiniCard label="Low stock" value="Whole Milk" />
                    </div>

                    <div className="mt-4">
                        <div className="text-xs text-gray-500">Quick actions</div>
                        <div className="mt-2 flex gap-2">
                            <button className="flex-1 py-2 rounded bg-amber-600 text-white text-sm">New order</button>
                            <button className="flex-1 py-2 rounded border text-sm">Stock</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

function MiniCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 bg-white rounded-lg border">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="mt-1 font-semibold">{value}</div>
        </div>
    );
}
