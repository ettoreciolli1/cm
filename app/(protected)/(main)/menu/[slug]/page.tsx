"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCafe } from "@/components/cafe/CafeContext";
import MenuItemHeader from "@/components/menu/item/MenuItemHeader";
import IngredientsSection from "@/components/menu/item/IngredientsSection";
import AddIngredientSection from "@/components/menu/item/AddIngredientSection";

export default function MenuItemPageClient() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug ? decodeURIComponent(String(params.slug)) : null;

    const {
        cafe,
        cafeLoading,
        cafeError,
        menuItems,
        menuLoading,
        menuError,
        ingredients,
        ingredientsLoading,
        ingredientsError,
        refetchIngredients,
        invalidateAll,
    } = useCafe();

    useEffect(() => {
        if (!slug) router.push("/menu");
    }, [slug, router]);

    const item = useMemo(() => menuItems?.find((m) => m.slug === slug), [menuItems, slug]);

    const ingredientsList = useMemo(() => {
        if (!ingredients || !item) return [];
        return ingredients
            .filter((ing) => ing.menu_item_slug === slug || ing.menu_item_id === item.id)
            .map((r) => ({
                id: r.id,
                name: r.name,
                quantity: r.quantity,
                unit: r.unit,
                cost: r.cost,
                allergen: r.allergen,
                notes: r.notes,
            }));
    }, [ingredients, item, slug]);

    const onIngredientAdded = async () => {
        if (refetchIngredients) await refetchIngredients();
        else if (invalidateAll) await invalidateAll();
        else router.refresh();
    };

    if (cafeLoading || menuLoading || ingredientsLoading) return <div className="max-w-3xl mx-auto p-6">Loading…</div>;

    const firstError = cafeError ?? menuError ?? ingredientsError;
    if (firstError) return <div className="max-w-3xl mx-auto p-6 text-red-600">Error: {firstError instanceof Error ? firstError.message : String(firstError)}</div>;

    if (!item) return <div className="max-w-3xl mx-auto p-6">Menu item not found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 text-black bg-gray-50">
            <MenuItemHeader name={item.name} description={item.description} price={item.price} currency={item.currency} />
            <IngredientsSection ingredients={ingredientsList} />
            <AddIngredientSection slug={item.slug} onAdded={onIngredientAdded} />
        </div>
    );
}
