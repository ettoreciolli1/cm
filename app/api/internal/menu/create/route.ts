// app/api/internal/menu/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/.";
import { cafes, menu_items } from "@/app/lib/schema";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";

/**
 * Server-side normalization helper for image_url.
 * - trims
 * - converts empty -> null
 * - prepends https:// if scheme missing
 */
function normalizeImageUrlMaybe(val: unknown) {
    if (typeof val !== "string") return null;
    const s = val.trim();
    if (!s) return null;
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(s)) {
        return `https://${s}`;
    }
    return s;
}

const createMenuItemSchema = z.object({
    name: z.string().min(1).max(300),
    slug: z.string().min(1).max(320).optional(),
    description: z.string().max(5000).nullable().optional(),
    price: z.coerce.number().nonnegative(),
    currency: z.string().max(10).optional().default("EUR"),
    available: z.boolean().optional().default(true),
    category: z.string().max(120).nullable().optional(),
    image_url: z.preprocess((v) => normalizeImageUrlMaybe(v), z.string().url().nullable().optional()),
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

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Debug log incoming raw payload
        console.log("[menu:create] incoming raw body:", body);

        // Validate + normalize with zod
        const parsed = createMenuItemSchema.safeParse(body);

        if (!parsed.success) {
            console.warn("[menu:create] validation failed:", parsed.error.format());
            return NextResponse.json({ ok: false, error: "validation", details: parsed.error.format() }, { status: 400 });
        }

        const payload = parsed.data;
        console.log("[menu:create] parsed payload:", payload);

        // Get session (server-side)
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const ownerId = session.user.id;

        // find cafe for owner
        const cafesRows = await db.select({ id: cafes.id }).from(cafes).where(eq(cafes.owner_id, ownerId)).limit(1);
        if (!cafesRows || cafesRows.length === 0) {
            return NextResponse.json({ ok: false, error: "no_cafe" }, { status: 400 });
        }
        const cafeId = cafesRows[0].id as number;

        // build slug
        let slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
        if (!slug) slug = `item-${Date.now()}`;

        // ensure unique
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
                if (counter > 50) throw new Error("failed_to_generate_unique_slug");
            }
        };
        slug = await ensureUniqueSlug(slug);

        // price -> cents
        const price_cents = Math.round(payload.price * 100);

        // insert
        const inserted = await db
            .insert(menu_items)
            .values({
                cafe_id: cafeId,
                name: payload.name,
                slug,
                description: payload.description ?? null,
                price_cents,
                currency: payload.currency ?? "EUR",
                available: payload.available ?? true,
                category: payload.category ?? null,
                image_url: payload.image_url ?? null,
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

        // Return useful JSON for UI
        return NextResponse.json({
            ok: true,
            item: {
                id: row.id,
                name: row.name,
                slug: row.slug,
                price: Number(row.price_cents) / 100,
                currency: row.currency,
                available: row.available,
                category: row.category,
                image_url: row.image_url,
                created_at: row.created_at,
            },
        });
    } catch (err: any) {
        console.error("[menu:create] unexpected error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}
