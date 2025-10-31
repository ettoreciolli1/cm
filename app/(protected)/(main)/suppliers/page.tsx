"use client";

import React, { useEffect, useState } from "react";
import { useCafe } from "@/components/cafe/CafeContext";
import SuppliersList from "@/components/suppliers/SuppliersList";

export default function SuppliersPage() {
    const { suppliers, suppliersLoading, suppliersError, refetchSuppliers } = useCafe();
    const [filter, setFilter] = useState("");

    useEffect(() => {
        refetchSuppliers().catch(() => { });
    }, [refetchSuppliers]);

    const filteredSuppliers = suppliers?.filter((s) =>
        filter ? s.name.toLowerCase().includes(filter.toLowerCase()) : true
    );

    return (
        <div className="max-w-4xl mx-auto p-6 text-black">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Suppliers</h1>
                <button
                    onClick={() => refetchSuppliers()}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                    Refresh
                </button>
            </div>

            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by supplier name"
                className="w-full p-2 mb-4 border rounded"
            />

            {suppliersLoading ? (
                <div className="p-4 bg-white rounded shadow">Loading suppliers…</div>
            ) : suppliersError ? (
                <div className="p-4 bg-white rounded shadow text-red-600">
                    Error loading suppliers: {(suppliersError as any)?.message ?? String(suppliersError)}
                </div>
            ) : !filteredSuppliers || filteredSuppliers.length === 0 ? (
                <div className="p-4 bg-white rounded shadow">No suppliers found.</div>
            ) : (
                <SuppliersList suppliers={filteredSuppliers} />
            )}
        </div>
    );
}
