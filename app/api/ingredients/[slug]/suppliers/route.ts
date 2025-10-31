// app/api/ingredients/[slug]/suppliers/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { db } from "@/.";
import { ingredients, menu_items, cafes, suppliers } from "@/app/lib/schema";
import { eq, sql, or } from "drizzle-orm";
import { slugify } from "@/app/lib/utils";
import { Supplier } from "@/app/lib/types";

const createSupplierSchema = z.object({
    name: z.string().min(1).max(300),
    contact: z.string().max(300).nullable().optional(),
    website: z.string().url().nullable().optional(),
    unit_price: z.coerce.number().min(0).optional(),
    unit: z.string().max(50).nullable().optional(),
    lead_time_days: z.coerce.number().int().min(0).nullable().optional(),
    preferred: z.boolean().optional().default(false),
    notes: z.string().max(2000).nullable().optional(),
});

async function findIngredientBySlugOrName(slugParam: string) {
    // slugParam already decoded by caller
    const slugLower = slugParam.toLowerCase().trim();

    // Try to find by menu_item_slug exactly OR by lower(name) to support names as slugs
    const rows = await db
        .select({
            id: ingredients.id,
            menu_item_id: ingredients.menu_item_id,
            name: ingredients.name,
            menu_item_slug: ingredients.menu_item_slug,
        })
        .from(ingredients)
        .leftJoin(menu_items, eq(menu_items.id, ingredients.menu_item_id))
        .leftJoin(cafes, eq(cafes.id, menu_items.cafe_id))
        .where(
            or(
                eq(ingredients.menu_item_slug, slugParam),
                // case-insensitive name compare
                sql`lower(${ingredients.name}) = ${slugLower}`
            )
        )
        .limit(1);

    return rows[0];
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const userId = session.user.id;

        const rawSlug = (await params).slug;
        if (!rawSlug) {
            return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });
        }
        const slug = decodeURIComponent(rawSlug);

        // find ingredient by menu_item_slug OR name (case-insensitive)
        const ing = await findIngredientBySlugOrName(slug);
        if (!ing) {
            return NextResponse.json({ ok: false, error: "ingredient_not_found" }, { status: 404 });
        }

        // verify ownership (via cafe owner)
        const ownerRow = await db
            .select({ owner_id: cafes.owner_id })
            .from(ingredients)
            .leftJoin(menu_items, eq(menu_items.id, ingredients.menu_item_id))
            .leftJoin(cafes, eq(cafes.id, menu_items.cafe_id))
            .where(eq(ingredients.id, ing.id))
            .limit(1)
            .then((r: any[]) => r[0]);

        if (!ownerRow || ownerRow.owner_id !== userId) {
            return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        // fetch suppliers for the ingredient id
        const rows = await db
            .select({
                id: suppliers.id,
                ingredient_id: suppliers.ingredient_id,
                name: suppliers.name,
                contact: suppliers.contact,
                website: suppliers.website,
                unit_price_cents: suppliers.unit_price_cents,
                unit: suppliers.unit,
                lead_time_days: suppliers.lead_time_days,
                preferred: suppliers.preferred,
                notes: suppliers.notes,
                created_at: suppliers.created_at,
                updated_at: suppliers.updated_at,
            })
            .from(suppliers)
            .where(eq(suppliers.ingredient_id, ing.id))
            .orderBy(sql`${suppliers.preferred} DESC`)
            .limit(200);

        const payload: Supplier[] = rows.map((r: any) => ({
            id: r.id,
            ingredient_id: r.ingredient_id,
            name: r.name,
            contact: r.contact ?? null,
            website: r.website ?? null,
            unit_price: r.unit_price_cents != null ? Number(r.unit_price_cents) / 100 : null,
            unit: r.unit ?? null,
            lead_time_days: r.lead_time_days ?? null,
            preferred: Boolean(r.preferred),
            notes: r.notes ?? null,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
            updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
        }));

        return NextResponse.json({ ok: true, suppliers: payload });
    } catch (err: any) {
        console.error("[api/ingredients/[slug]/suppliers GET] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const userId = session.user.id;

        const rawSlug = (params).slug;
        if (!rawSlug) {
            return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });
        }
        const slug = decodeURIComponent(rawSlug);

        const body = await req.json();
        const parsed = createSupplierSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "validation", details: parsed.error.format() }, { status: 400 });
        }
        const payload = parsed.data;

        // fetch ingredient and verify ownership (reusing helper)
        const ownerRow = await db
            .select({ id: ingredients.id, owner_id: cafes.owner_id })
            .from(ingredients)
            .leftJoin(menu_items, eq(menu_items.id, ingredients.menu_item_id))
            .leftJoin(cafes, eq(cafes.id, menu_items.cafe_id))
            .where(
                or(
                    eq(ingredients.menu_item_slug, slug),
                    sql`lower(${ingredients.name}) = ${slug.toLowerCase()}`
                )
            )
            .limit(1)
            .then((r: any[]) => r[0]);

        if (!ownerRow || ownerRow.owner_id !== userId) {
            return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        const unit_price_cents = payload.unit_price ? Math.round(payload.unit_price * 100) : 0;
        const slug_ = slugify(payload.name);

        const inserted = await db
            .insert(suppliers)
            .values({
                ingredient_id: ownerRow.id,
                slug: slug_, // if your suppliers table has slug column; otherwise remove
                name: payload.name,
                contact: payload.contact ?? null,
                website: payload.website ?? null,
                unit_price_cents,
                unit: payload.unit ?? null,
                lead_time_days: payload.lead_time_days ?? null,
                preferred: payload.preferred ?? false,
                notes: payload.notes ?? null,
            })
            .returning({
                id: suppliers.id,
                ingredient_id: suppliers.ingredient_id,
                name: suppliers.name,
                contact: suppliers.contact,
                website: suppliers.website,
                unit_price_cents: suppliers.unit_price_cents,
                unit: suppliers.unit,
                lead_time_days: suppliers.lead_time_days,
                preferred: suppliers.preferred,
                notes: suppliers.notes,
                created_at: suppliers.created_at,
            });

        const row = inserted[0];
        return NextResponse.json({
            ok: true,
            supplier: {
                id: row.id,
                ingredient_id: row.ingredient_id,
                name: row.name,
                contact: row.contact ?? null,
                website: row.website ?? null,
                unit_price: row.unit_price_cents != null ? Number(row.unit_price_cents) / 100 : null,
                unit: row.unit ?? null,
                lead_time_days: row.lead_time_days ?? null,
                preferred: Boolean(row.preferred),
                notes: row.notes ?? null,
                created_at: row.created_at,
            },
        });
    } catch (err: any) {
        console.error("[api/ingredients/[slug]/suppliers POST] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}
