"use client";

import React, { useState, useEffect } from "react";
import { useCafe } from "@/components/cafe/CafeContext";

export default function CafeEditPage() {
    const { cafe, cafeLoading, cafeError, updateCafe, refetchCafe } = useCafe();
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (cafe) setFormData({
            name: cafe.name,
            address: cafe.address ?? "",
            phone: cafe.phone ?? "",
        });
    }, [cafe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormLoading(true);
        await updateCafe(formData);
        setFormLoading(false);
    };

    if (cafeLoading) return <div className="p-6">Loading cafe…</div>;
    if (cafeError) return <div className="p-6 text-red-600">{cafeError}</div>;
    if (!cafe) return <div className="p-6">No cafe found</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Edit Cafe</h1>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    placeholder="Cafe Name"
                    className="border p-2 w-full rounded"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Address"
                    className="border p-2 w-full rounded"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Phone"
                    className="border p-2 w-full rounded"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <button className="bg-black text-white px-4 py-2 rounded" type="submit" disabled={formLoading}>
                    {formLoading ? "Saving…" : "Save Cafe"}
                </button>
            </form>
        </div>
    );
}
