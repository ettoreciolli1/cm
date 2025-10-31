"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCafe } from "@/components/cafe/CafeContext";
import AddSupplierForm from "@/components/ingredients/AddSupplierForm";

export default function IngredientPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const {
        currentIngredient,
        currentIngredientLoading,
        currentIngredientError,
        setCurrentIngredientSlug,
        fetchSuppliers,
        invalidateIngredientSuppliers,
        deleteCurrentIngredientSupplier,
        refetchCurrentIngredientSuppliers
    } = useCafe();

    const [suppliers, setSuppliers] = React.useState<any[]>([]);
    const [suppliersLoading, setSuppliersLoading] = React.useState(true);
    const [suppliersError, setSuppliersError] = React.useState<any>(null);

    // set the slug so context fetches the ingredient
    useEffect(() => {
        if (slug) setCurrentIngredientSlug(slug);
    }, [slug, setCurrentIngredientSlug]);

    // fetch suppliers whenever current ingredient is loaded
    useEffect(() => {
        if (!slug) return;
        setSuppliersLoading(true);
        fetchSuppliers(slug)
            .then((data) => setSuppliers(data))
            .catch((err) => setSuppliersError(err))
            .finally(() => setSuppliersLoading(false));
    }, [slug, fetchSuppliers]);

    if (!slug) return <div className="p-6">Invalid ingredient slug.</div>;

    if (currentIngredientLoading) return <div className="p-6">Loading ingredient…</div>;
    if (currentIngredientError)
        return (
            <div className="p-6 text-red-600">
                Error loading ingredient: {(currentIngredientError as any)?.message ?? String(currentIngredientError)}
            </div>
        );
    if (!currentIngredient) return <div className="p-6">Ingredient not found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h1 className="text-2xl font-bold mb-1">{currentIngredient.name}</h1>
                    <p className="text-sm text-gray-600">
                        Used in:{" "}
                        {currentIngredient.menu_item_name
                            ? `${currentIngredient.menu_item_name} (${currentIngredient.menu_item_slug})`
                            : currentIngredient.menu_item_slug ?? "—"}
                    </p>
                </div>
                <div className="text-right">
                    {typeof currentIngredient.cost === "number" ? (
                        <div className="font-semibold">
                            {currentIngredient.cost.toFixed(2)} {currentIngredient.unit ?? ""}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No cost</div>
                    )}
                </div>
            </div>

            <section className="mb-6">
                <h2 className="font-semibold mb-3">Suppliers</h2>
                {suppliersLoading ? (
                    <div className="p-4 bg-white rounded shadow">Loading suppliers…</div>
                ) : suppliersError ? (
                    <div className="p-4 bg-white rounded shadow text-red-600">
                        Error loading suppliers: {(suppliersError as any)?.message ?? String(suppliersError)}
                    </div>
                ) : suppliers.length === 0 ? (
                    <div className="p-4 bg-white rounded shadow">No suppliers yet.</div>
                ) : (
                    <div className="space-y-3">
                        {suppliers.map((s: any) => (
                            <div key={s.id} className="p-3 bg-white rounded shadow flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{s.name}</div>
                                    {s.contact && <div className="text-xs text-gray-500">{s.contact}</div>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right text-sm text-gray-700">
                                        {typeof s.unit_price === "number"
                                            ? `${s.unit_price.toFixed(2)} ${currentIngredient.unit ?? ""}`
                                            : "—"}
                                    </div>
                                    <button
                                        className="text-red-600 text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-50"
                                        onClick={async () => {
                                            if (!confirm(`Delete supplier "${s.name}"?`)) return;
                                            await deleteCurrentIngredientSupplier(s.id);
                                            await refetchCurrentIngredientSuppliers()
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </section>

            <section>
                <h2 className="font-semibold mb-3">Add supplier</h2>
                <AddSupplierForm
                    ingredientSlug={slug}
                    onSuccess={async () => {
                        await invalidateIngredientSuppliers(slug);
                    }}
                />
            </section>
        </div>
    );
}
