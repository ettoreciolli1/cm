"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export interface Supplier {
    id: number;
    name: string;
    contact?: string | null;
    website?: string | null;
    unit_price?: number | null;
    preferred?: boolean;
    notes?: string | null;
}

interface SupplierCardProps {
    supplier: Supplier;
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
    const router = useRouter();

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/suppliers/${supplier.id}`)}
            className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-150"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-medium text-lg">{supplier.name}</div>
                    {supplier.notes && <div className="text-sm text-gray-500 mt-1">{supplier.notes}</div>}
                    <div className="text-sm text-gray-600 mt-1">{supplier.contact ?? supplier.website ?? "—"}</div>
                </div>
                <div className="text-right">
                    <div className="font-semibold">{supplier.unit_price != null ? supplier.unit_price.toFixed(2) : "—"}</div>
                    {supplier.preferred && <div className="text-sm text-green-600 mt-1">Preferred</div>}
                </div>
            </div>
        </motion.div>
    );
}
