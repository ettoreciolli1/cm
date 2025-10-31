// components/menu/AddIngredientForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.string().max(100).optional().nullable(),
    unit: z.string().max(50).optional().nullable(),
    cost: z.coerce.number().min(0).optional(),
    allergen: z.boolean().optional().default(false),
    notes: z.string().max(2000).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function AddIngredientForm({ slug, onAdded }: { slug: string, onAdded: () => void }) {
    console.log(slug)
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [serverDetails, setServerDetails] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const resolver = zodResolver(schema) as unknown as Resolver<FormValues, any>;
    const { register, handleSubmit, reset, formState } = useForm<FormValues>({
        resolver,
        defaultValues: {
            name: "",
            quantity: "",
            unit: "",
            cost: 0,
            allergen: false,
            notes: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setServerError(null);
        setServerDetails(null);
        setLoading(true);

        try {
            const res = await fetch(`/api/menu/items/ingredients/${encodeURIComponent(slug)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const json = await res.json();
            if (!res.ok) {
                setServerError(json.error ?? "Server error");
                setServerDetails(json.details ?? null);
                setLoading(false);
                return;
            }

            reset();
            onAdded?.();
        } catch (err: any) {
            console.error("add ingredient error", err);
            setServerError(err?.message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded shadow space-y-3">
            <div>
                <label className="block text-sm">Name</label>
                <input {...register("name")} className="w-full border rounded p-2" />
                {formState.errors.name && <div className="text-sm text-red-600">{formState.errors.name.message}</div>}
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm">Quantity</label>
                    <input {...register("quantity")} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm">Unit</label>
                    <input {...register("unit")} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm">Cost (€)</label>
                    <input type="number" step="0.01" {...register("cost", { valueAsNumber: true })} className="w-full border rounded p-2" />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("allergen")} />
                    <span className="text-sm">Allergen</span>
                </label>

                <div className="flex-1" />
                <button disabled={loading} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
                    {loading ? "Adding…" : "Add ingredient"}
                </button>
            </div>

            {serverError && <div className="text-sm text-red-600">{serverError}</div>}
            {serverDetails && <pre className="text-xs text-gray-600">{JSON.stringify(serverDetails, null, 2)}</pre>}
        </form>
    );
}
