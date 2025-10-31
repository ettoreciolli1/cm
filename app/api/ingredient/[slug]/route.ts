import { NextResponse } from "next/server";
import { db } from "@/.";
import { ingredients, menu_items } from "@/app/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const slug = (params).slug;
        console.log("fjsdfh")
        if (!slug) {
            return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });
        }

        // Fetch ingredient along with its menu item name and slug
        const rows = await db
            .select({
                id: ingredients.id,
                name: ingredients.name,
                quantity: ingredients.quantity,
                unit: ingredients.unit,
                cost_cents: ingredients.cost_cents,
                allergen: ingredients.allergen,
                notes: ingredients.notes,
                menu_item_id: ingredients.menu_item_id,
                menu_item_name: menu_items.name,
                menu_item_slug: menu_items.slug,
                created_at: ingredients.created_at,
                updated_at: ingredients.updated_at,
            })
            .from(ingredients)
            .leftJoin(menu_items, eq(ingredients.menu_item_id, menu_items.id))
            .where(eq(ingredients.name, slug)) // Assuming slug is based on name; adjust if you have a separate slug
            .limit(1);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: false, error: "ingredient_not_found" }, { status: 404 });
        }

        const row = rows[0];

        const ingredient = {
            id: row.id,
            name: row.name,
            quantity: row.quantity,
            unit: row.unit,
            cost: row.cost_cents != null ? Number(row.cost_cents) / 100 : 0,
            allergen: row.allergen,
            notes: row.notes,
            menu_item_id: row.menu_item_id,
            menu_item_name: row.menu_item_name,
            menu_item_slug: row.menu_item_slug,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };

        console.log(ingredient)

        return NextResponse.json({ ok: true, ingredient });
    } catch (err: any) {
        console.error("[ingredient:get] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}
