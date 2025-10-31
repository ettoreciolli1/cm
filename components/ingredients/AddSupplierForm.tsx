"use client";

import React, { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCafe } from "../cafe/CafeContext";

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().max(300).optional().nullable(),
    website: z
        .string()
        .optional()
        .nullable()
        .transform((val) => {
            if (!val) return null;
            if (!/^https?:\/\//i.test(val)) return `https://${val}`;
            return val;
        })
        .refine((val) => {
            if (!val) return true;
            try {
                new URL(val);
                return true;
            } catch {
                return false;
            }
        }, "Invalid URL"),
    unit_price: z.coerce.number().min(0).optional(),
    unit: z.string().max(50).optional().nullable(),
    lead_time_days: z.coerce.number().int().min(0).optional().nullable(),
    preferred: z.boolean().optional(),
    notes: z.string().max(2000).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function AddSupplierForm({
    ingredientSlug,
    onSuccess,
}: {
    ingredientSlug: string;
    onSuccess?: () => void;
}) {
    const resolver = zodResolver(schema) as unknown as Resolver<FormValues, any>;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver,
        defaultValues: {
            name: "",
            contact: "",
            website: "",
            unit_price: 0,
            unit: "",
            lead_time_days: 0,
            preferred: false,
            notes: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { refetchCurrentIngredientSuppliers } = useCafe();
    const onSubmit = async (values: FormValues) => {
        setServerError(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/ingredients/${ingredientSlug}/suppliers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const json = await res.json();
            if (!res.ok) {
                setServerError(json?.error ?? "Failed to add supplier");
                setLoading(false);
                return;
            }
            reset();
            onSuccess?.();
            await refetchCurrentIngredientSuppliers();


        } catch (err: any) {
            setServerError(err?.message ?? "Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="text-black bg-white p-4 rounded shadow space-y-3">
            <div>
                <label className="block text-sm">Name</label>
                <input {...register("name")} className="w-full border rounded p-2" />
                {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
            </div>

            <div>
                <label className="block text-sm">Contact</label>
                <input {...register("contact")} className="w-full border rounded p-2" />
            </div>

            <div>
                <label className="block text-sm">Website</label>
                <input {...register("website")} className="w-full border rounded p-2" placeholder="www.example.com or https://example.com" />
                {errors.website && <div className="text-sm text-red-600">{errors.website.message}</div>}
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm">Unit price</label>
                    <input type="number" step="0.01" {...register("unit_price", { valueAsNumber: true })} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm">Unit</label>
                    <input {...register("unit")} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm">Lead time (days)</label>
                    <input type="number" {...register("lead_time_days", { valueAsNumber: true })} className="w-full border rounded p-2" />
                </div>
            </div>

            <div>
                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register("preferred")} />
                    <span className="text-sm">Preferred</span>
                </label>
            </div>

            <div>
                <label className="block text-sm">Notes</label>
                <textarea {...register("notes")} className="w-full border rounded p-2" rows={3} />
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
                    {loading ? "Adding…" : "Add supplier"}
                </button>
                {serverError && <div className="text-sm text-red-600">{serverError}</div>}
            </div>
        </form>
    );
}
