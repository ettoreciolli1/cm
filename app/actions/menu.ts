// app/actions/menu.ts
"use server";

import { z } from "zod";
import { db } from "@/."; // <-- ensure this path points to your db client
import { menu_items, cafes } from "@/app/lib/schema";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";

// app/actions/menu.ts  (excerpt)
const createMenuItemSchema = z.object({
    name: z.string().min(1).max(300),
    slug: z.string().optional(),
    description: z.string().max(5000).nullable().optional(),
    price: z.coerce.number().nonnegative(),
    currency: z.string().max(10).optional().default("EUR"),
    available: z.boolean().optional().default(true),
    category: z.string().max(120).nullable().optional(),
    image_url: z.preprocess((val) => {
        if (typeof val !== "string") return null;
        const s = val.trim();
        if (s === "") return null;
        if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(s)) {
            return `https://${s}`;
        }
        return s;
    }, z.string().url().nullable().optional()),
});


function slugify(s: string) {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 200);
}

export async function createMenuItemAction(payload: unknown) {
    const parsed = createMenuItemSchema.parse(payload);

    // Server-side session check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const ownerId = session.user.id;

    // Find cafe for owner (assumes one cafe per owner)
    const cafesRows = await db
        .select({ id: cafes.id })
        .from(cafes)
        .where(eq(cafes.owner_id, ownerId))
        .limit(1);

    if (!cafesRows || cafesRows.length === 0) {
        throw new Error("No cafe found for current user. Create a cafe first.");
    }
    const cafeId = cafesRows[0].id as number;

    // Build slug
    let slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name);
    if (!slug) slug = `item-${Date.now()}`;

    // Ensure unique slug per cafe using AND clause (and loop if needed)
    const ensureUniqueSlug = async (base: string) => {
        let candidate = base;
        let counter = 0;
        while (true) {
            const rows = await db
                .select({ id: menu_items.id })
                .from(menu_items)
                .where(and(eq(menu_items.cafe_id, cafeId), eq(menu_items.slug, candidate)))
                .limit(1);

            if (!rows || rows.length === 0) return candidate;
            counter++;
            candidate = `${base}-${counter}`;
            if (counter > 50) throw new Error("Failed to generate unique slug");
        }
    };

    slug = await ensureUniqueSlug(slug);

    // Convert price (number) to integer cents for DB
    const price_cents = Math.round(parsed.price * 100);

    // Insert menu item
    const inserted = await db
        .insert(menu_items)
        .values({
            cafe_id: cafeId,
            name: parsed.name,
            slug,
            description: parsed.description ?? null,
            price_cents,
            currency: parsed.currency ?? "EUR",
            available: parsed.available ?? true,
            category: parsed.category ?? null,
            image_url: parsed.image_url ?? null,
        })
        .returning({
            id: menu_items.id,
            name: menu_items.name,
            slug: menu_items.slug,
            price_cents: menu_items.price_cents,
            currency: menu_items.currency,
            available: menu_items.available,
            category: menu_items.category,
            image_url: menu_items.image_url,
            created_at: menu_items.created_at,
        });

    const row = inserted[0];

    // Return a friendly shape (price as decimal)
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        price: Number(row.price_cents) / 100,
        currency: row.currency,
        available: row.available,
        category: row.category,
        image_url: row.image_url,
        created_at: row.created_at,
    };
}
