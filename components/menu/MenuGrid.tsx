"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItemCard from "@/components/menu/MenuItemCard";

type MenuItem = any;

export default function MenuGrid({
    items,
    loading,
    error,
}: {
    items?: MenuItem[] | undefined;
    loading?: boolean;
    error?: any;
}) {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Menu items</h2>
                <div className="text-sm text-gray-500">{items ? items.length : "—"} items</div>
            </div>

            <div>
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-36 bg-white rounded-2xl shadow animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-6 bg-white rounded-2xl shadow text-red-600">
                        Error loading menu: {(error as any)?.message ?? String(error)}
                    </div>
                ) : !items || items.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl shadow text-gray-500">
                        No menu items yet — add your first item using the form to the right.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                        <AnimatePresence initial={false}>
                            {items.map((it: MenuItem) => (
                                <motion.div
                                    key={it.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    layout
                                >
                                    <MenuItemCard item={it} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </section>
    );
}
