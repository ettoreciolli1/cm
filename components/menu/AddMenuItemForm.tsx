"use client";

import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

/** client-side normalization for the image field (same logic as server) */
function normalizeClientImageUrlMaybe(val: unknown) {
    if (typeof val !== "string") return null;
    const s = val.trim();
    if (!s) return null;
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(s)) {
        return `https://${s}`;
    }
    return s;
}

const schema = z.object({
    name: z.string().min(1, "Name required"),
    slug: z.string().optional(),
    description: z.string().max(5000).optional(),
    price: z.coerce.number().nonnegative(),
    currency: z.string().max(10).optional(),
    available: z.boolean().optional(),
    category: z.string().max(120).optional(),
    image_url: z.preprocess((v) => normalizeClientImageUrlMaybe(v), z.string().url().nullable().optional()),
});

type FormValues = z.infer<typeof schema>;

type AMIFProps = {
    onCreated: (() => void)
}

export default function AddMenuItemForm(props: AMIFProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [serverDetails, setServerDetails] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const resolver = zodResolver(schema) as unknown as Resolver<FormValues, any>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            price: 0,
            currency: "EUR",
            available: true,
            category: "",
            image_url: "",
        },
        shouldFocusError: true, // keep default
    });

    const onSubmit = async (values: FormValues) => {
        setServerError(null);
        setServerDetails(null);
        setSuccessMessage(null);

        setLoading(true);

        // console log normalized payload
        console.log("[client] payload to send:", values);

        try {
            const res = await fetch("/api/internal/menu/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const json = await res.json();
            console.log("[client] server response:", json);

            if (!res.ok) {
                // validation errors return { ok: false, error: 'validation', details: {...} }
                setServerError(json.error ?? "Server error");
                setServerDetails(json.details ?? null);
                setLoading(false);
                return;
            }

            // success
            setSuccessMessage(`Created "${json.item.name}"`);
            reset();
            props.onCreated();
        } catch (err: any) {
            console.error("[client] unexpected error:", err);
            setServerError(err?.message ?? "Network or unexpected error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded p-4 shadow">
            <h3 className="font-semibold mb-4">Add menu item</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                <div>
                    <label className="block text-sm">Name</label>
                    <input {...register("name")} className="w-full border rounded p-2" />
                    {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
                </div>

                <div>
                    <label className="block text-sm">Slug (optional)</label>
                    <input {...register("slug")} className="w-full border rounded p-2" />
                    {errors.slug && <div className="text-sm text-red-600">{errors.slug.message}</div>}
                    <div className="text-xs text-gray-500 mt-1">If left blank we'll generate a slug from the name.</div>
                </div>

                <div>
                    <label className="block text-sm">Description</label>
                    <textarea {...register("description")} className="w-full border rounded p-2" rows={3} />
                    {errors.description && <div className="text-sm text-red-600">{errors.description.message}</div>}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm">Price</label>
                        <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="w-full border rounded p-2" />
                        {errors.price && <div className="text-sm text-red-600">{errors.price.message}</div>}
                    </div>

                    <div>
                        <label className="block text-sm">Currency</label>
                        <input {...register("currency")} className="w-full border rounded p-2" />
                        {errors.currency && <div className="text-sm text-red-600">{errors.currency.message}</div>}
                    </div>

                    <div>
                        <label className="block text-sm">Category</label>
                        <input {...register("category")} className="w-full border rounded p-2" />
                        {errors.category && <div className="text-sm text-red-600">{errors.category.message}</div>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm">Image URL</label>
                    <input type="url" placeholder="https://example.com/image.jpg" {...register("image_url")} className="w-full border rounded p-2" />
                    {errors.image_url && <div className="text-sm text-red-600">{(errors.image_url as any).message}</div>}
                </div>

                <div className="flex items-center gap-3 w-min mx-auto text-nowrap">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60 cursor-pointer">
                        {loading ? "Saving..." : "Save item"}
                    </button>

                    {serverError && <div className="text-sm text-red-600">{serverError}</div>}
                    {serverDetails && <pre className="text-xs text-gray-600 mt-2">{JSON.stringify(serverDetails, null, 2)}</pre>}
                    {successMessage && <div className="text-sm text-green-600">{successMessage}</div>}
                </div>
            </form>
        </div>
    );
}
