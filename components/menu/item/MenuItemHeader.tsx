"use client";

import React from "react";
import { motion } from "framer-motion";

interface MenuItemHeaderProps {
    name: string;
    description?: string | null;
    price?: number;
    currency?: string | null;
}

export default function MenuItemHeader({ name, description, price, currency }: MenuItemHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-6"
        >
            <div>
                <h1 className="text-3xl font-bold">{name}</h1>
                {description && <p className="text-gray-600 mt-1">{description}</p>}
            </div>
            {price != null && (
                <div className="text-right text-xl font-semibold">
                    {price.toFixed(2)} {currency ?? ""}
                </div>
            )}
        </motion.div>
    );
}
