"use client";

import React, { useMemo } from "react";
import { useCafe } from "@/components/cafe/CafeContext";
import IngredientsList, { IngredientItem } from "@/components/ingredients/IngredientsList";
import { GroupedMenuItem } from "@/components/ingredients/IngredientCard";

export default function IngredientsPage() {
    const { ingredients, ingredientsLoading, ingredientsError, refetchIngredients } = useCafe();

    // Group ingredients by name
    const grouped = useMemo<IngredientItem[]>(() => {
        if (!ingredients) return [];

        const map = new Map<string, Map<number, GroupedMenuItem>>();

        for (const ing of ingredients) {
            const name = (ing.name ?? "").trim();
            if (!name) continue;

            const menuItemId = ing.menu_item_id;
            const menuItemSlug = ing.menu_item_slug ?? String(menuItemId ?? "");
            const menuItemName = ing.menu_item_name ?? `Item ${menuItemId ?? "?"}`;

            const menuItem: GroupedMenuItem = {
                id: Number(menuItemId ?? 0),
                name: menuItemName,
                slug: menuItemSlug,
            };

            if (!map.has(name)) map.set(name, new Map());
            const inner = map.get(name)!;
            inner.set(menuItem.id || inner.size + 1, menuItem);
        }

        return Array.from(map.entries()).map(([name, itemsMap]) => ({
            name,
            menuItemCount: itemsMap.size,
            menuItems: Array.from(itemsMap.values()),
        }));
    }, [ingredients]);

    if (ingredientsLoading) return <div className="max-w-4xl mx-auto p-6">Loading ingredients…</div>;
    if (ingredientsError) return <div className="max-w-4xl mx-auto p-6 text-red-600">Error: {(ingredientsError as any)?.message ?? String(ingredientsError)}</div>;
    if (!grouped || grouped.length === 0) return <div className="max-w-4xl mx-auto p-6"><div className="p-6 bg-white rounded shadow">No ingredients found.</div></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 text-black">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Ingredients</h1>
                <button
                    onClick={() => refetchIngredients?.()}
                    className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                    Refresh
                </button>
            </div>

            <IngredientsList ingredients={grouped} />
        </div>
    );
}
