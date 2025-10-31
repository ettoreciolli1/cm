"use client";

import React from "react";
import IngredientRow from "../IngredientRow";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { slugify } from "@/app/lib/utils"; // your utility to make URL-friendly slugs

interface Ingredient {
    id: number;
    name: string;
    quantity?: string;
    unit?: string;
    cost?: number;
    allergen?: boolean;
    notes?: string;
}

interface IngredientsSectionProps {
    ingredients: Ingredient[];
}

export default function IngredientsSection({ ingredients }: IngredientsSectionProps) {
    return (
        <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <div className="space-y-3">
                {ingredients.length === 0 ? (
                    <div className="p-4 bg-white rounded-lg shadow">No ingredients yet.</div>
                ) : (
                    <AnimatePresence>
                        {ingredients.map((ing) => {
                            const slug = slugify(ing.name);
                            return (
                                <motion.div
                                    key={ing.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link href={`/ingredients/${encodeURIComponent(slug)}`} passHref>
                                        <div className="block hover:bg-gray-50 rounded transition">
                                            <IngredientRow ing={ing} />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </section>
    );
}
