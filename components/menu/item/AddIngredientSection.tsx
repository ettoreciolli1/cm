"use client";

import React from "react";
import AddIngredientForm from "../AddIngredientForm";

interface AddIngredientSectionProps {
    slug: string;
    onAdded: () => void;
}

export default function AddIngredientSection({ slug, onAdded }: AddIngredientSectionProps) {
    return (
        <section className="mt-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">Add Ingredient</h2>
            <AddIngredientForm slug={slug} onAdded={onAdded} />
        </section>
    );
}
