// components/menu/IngredientRow.tsx
"use client";

import React from "react";

export default function IngredientRow({ ing }: any) {
    return (
        <div className="p-3 bg-white rounded shadow flex items-start gap-4">
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">{ing.name}</div>
                        <div className="text-xs text-gray-500">
                            {ing.quantity ?? ""} {ing.unit ? `· ${ing.unit}` : ""}
                        </div>
                    </div>
                    <div className="text-sm text-right">
                        <div>{ing.cost ? `${Number(ing.cost).toFixed(2)} €` : "—"}</div>
                        <div className={`text-xs ${ing.allergen ? "text-red-600" : "text-gray-500"}`}>
                            {ing.allergen ? "Allergen" : "OK"}
                        </div>
                    </div>
                </div>

                {ing.notes && <div className="mt-2 text-sm text-gray-700">{ing.notes}</div>}
            </div>
        </div>
    );
}
