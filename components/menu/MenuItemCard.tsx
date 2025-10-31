"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MenuItemCard({ item }: { item: any }) {
    const price = typeof item.price === "number" ? item.price : item.price_cents ? item.price_cents / 100 : null;
    const image = item.image_url || null;

    return (
        <motion.article
            layout
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow p-4 flex gap-4 items-start"
        >
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 7v10a2 2 0 0 0 2 2h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="7" y="3" width="10" height="4" rx="1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                        {item.category && <div className="text-xs text-indigo-600 mt-1">{item.category}</div>}
                        {item.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>}
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="font-medium text-gray-900">
                            {price != null ? `${price.toFixed(2)} ${item.currency ?? "€"}` : "—"}
                        </div>
                        <Link href={`/menu/${encodeURIComponent(item.slug ?? item.id)}`} className="inline-block mt-3 text-indigo-600 text-sm">
                            View
                        </Link>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                    <div>Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</div>
                    <div>•</div>
                    <div>{item.available ? "Available" : "Hidden"}</div>
                </div>
            </div>
        </motion.article>
    );
}
