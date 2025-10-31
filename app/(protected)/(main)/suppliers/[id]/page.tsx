"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCafe } from "@/components/cafe/CafeContext";

export default function SupplierDetailPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const supplierId = idParam ? Number(idParam) : null;

    const { getSupplierById, deleteSupplier, refetchSuppliers } = useCafe();

    const [supplier, setSupplier] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!supplierId) {
                setError("Invalid supplier id");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const s = await getSupplierById(supplierId);
                if (!s) {
                    setError("Supplier not found");
                    setSupplier(null);
                } else {
                    setSupplier(s);
                }
            } catch (err: any) {
                setError(err?.message ?? "Failed to load supplier");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [supplierId, getSupplierById]);

    const onDelete = async () => {
        if (!supplierId) return;
        if (!confirm("Delete this supplier? This cannot be undone.")) return;
        setDeleting(true);
        try {
            await deleteSupplier(supplierId);
            // refresh suppliers list in context and navigate back
            await refetchSuppliers();
            router.push("/suppliers");
        } catch (err: any) {
            alert(err?.message ?? "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-6 text-black">Loading supplier…</div>;
    if (error) return <div className="p-6 text-black text-red-600">Error: {error}</div>;
    if (!supplier) return <div className="p-6 text-black">Supplier not found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 text-black">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{supplier.name}</h1>
                    <div className="text-sm text-gray-600">{supplier.contact ?? supplier.website ?? ""}</div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push("/suppliers")}
                        className="px-3 py-1 border rounded bg-white"
                    >
                        Back
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                        {deleting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded shadow p-4">
                <dl className="grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-xs text-gray-500">ID</dt>
                        <dd className="font-medium">{supplier.id}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Ingredient</dt>
                        <dd className="font-medium">{supplier.ingredient_slug ?? "—"}</dd>
                    </div>

                    <div>
                        <dt className="text-xs text-gray-500">Unit price</dt>
                        <dd>{typeof supplier.unit_price === "number" ? supplier.unit_price.toFixed(2) : "—"}</dd>
                    </div>

                    <div>
                        <dt className="text-xs text-gray-500">Unit</dt>
                        <dd>{supplier.unit ?? "—"}</dd>
                    </div>

                    <div>
                        <dt className="text-xs text-gray-500">Lead time (days)</dt>
                        <dd>{supplier.lead_time_days ?? "—"}</dd>
                    </div>

                    <div>
                        <dt className="text-xs text-gray-500">Preferred</dt>
                        <dd>{supplier.preferred ? "Yes" : "No"}</dd>
                    </div>

                    <div className="col-span-2">
                        <dt className="text-xs text-gray-500">Notes</dt>
                        <dd className="mt-1">{supplier.notes ?? "—"}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
