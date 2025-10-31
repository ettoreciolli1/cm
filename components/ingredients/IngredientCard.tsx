"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface GroupedMenuItem {
    id: number;
    name: string;
    slug: string;
}

interface IngredientCardProps {
    name: string;
    menuItems: GroupedMenuItem[];
}

export default function IngredientCard({ name, menuItems }: IngredientCardProps) {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen((prev) => !prev);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <button
                onClick={toggle}
                className="w-full flex justify-between items-center p-4 font-medium hover:bg-gray-50 focus:outline-none"
            >
                <span className="truncate">{name}</span>
                <span className="text-sm text-gray-600">
                    Used in {menuItems.length} menu item{menuItems.length !== 1 ? "s" : ""}
                </span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key={name}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-4 pb-4"
                    >
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            {menuItems.map((item) => (
                                <li key={item.id || item.slug}>
                                    <Link href={`/menu/${item.slug}`} className="text-indigo-600 underline">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-3 flex items-center justify-between">
                            <Link
                                href={`/ingredients/${encodeURIComponent(name)}`}
                                className="text-indigo-600 font-medium underline"
                            >
                                View full details
                            </Link>

                            <button
                                onClick={toggle}
                                className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
