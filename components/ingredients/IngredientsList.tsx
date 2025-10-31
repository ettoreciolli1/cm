"use client";

import React, { useMemo } from "react";
import IngredientCard, { GroupedMenuItem } from "./IngredientCard";

export interface IngredientItem {
    name: string;
    menuItemCount: number;
    menuItems: GroupedMenuItem[];
}

interface IngredientsListProps {
    ingredients: IngredientItem[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
    const sortedIngredients = useMemo(() => {
        return [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
    }, [ingredients]);

    return (
        <div className="grid gap-3">
            {sortedIngredients.map((ingredient) => (
                <IngredientCard key={ingredient.name} name={ingredient.name} menuItems={ingredient.menuItems} />
            ))}
        </div>
    );
}
