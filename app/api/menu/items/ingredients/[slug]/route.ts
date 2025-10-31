// app/api/menu/items/[slug]/ingredients/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/.";
import { menu_items, ingredients, cafes } from "@/app/lib/schema";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { and as exprAnd } from "drizzle-orm"; // if needed by your Drizzle version

const createIngredientSchema = z.object({
    name: z.string().min(1).max(300),
    quantity: z.string().max(100).nullable().optional(),
    unit: z.string().max(50).nullable().optional(),
    cost: z.coerce.number().min(0).optional(), // client sends decimal e.g. 1.25 -> server converts to cents
    allergen: z.boolean().optional().default(false),
    notes: z.string().max(2000).nullable().optional(),
});

function slugify(s: string) {
    return s.toLowerCase().trim().replace(/\s+/g, "-");
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
    try {
        const raw = await req.json();
        const p = await params;

        // Validate body
        const parsed = createIngredientSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "validation", details: parsed.error.format() }, { status: 400 });
        }
        const payload = parsed.data;

        // server session
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const ownerId = session.user.id;

        const slug = decodeURIComponent(p.slug ?? "");
        if (!slug) return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });

        // find menu item, but ensure this owner owns the cafe that owns the item
        // first join: menu_items -> cafes (menu_items.cafe_id == cafes.id) then check cafes.owner_id = ownerId
        const items = await db
            .select({
                id: menu_items.id,
                cafe_id: menu_items.cafe_id,
            })
            .from(menu_items)
            .where(eq(menu_items.slug, slug))
            .limit(1);

        if (!items || items.length === 0) {
            return NextResponse.json({ ok: false, error: "item_not_found" }, { status: 404 });
        }
        const menuItem = items[0];

        // verify ownership: find cafe by id and owner_id
        const cafesRows = await db
            .select({ id: cafes.id, owner_id: cafes.owner_id })
            .from(cafes)
            .where(and(eq(cafes.id, menuItem.cafe_id), eq(cafes.owner_id, ownerId)))
            .limit(1);

        if (!cafesRows || cafesRows.length === 0) {
            return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
        }

        // convert cost decimal -> cents (if provided)
        const cost_cents = payload.cost != null ? Math.round(payload.cost * 100) : 0;

        // insert ingredient
        const inserted = await db
            .insert(ingredients)
            .values({
                menu_item_id: menuItem.id,
                name: payload.name,
                quantity: payload.quantity ?? null,
                unit: payload.unit ?? null,
                cost_cents,
                allergen: payload.allergen ?? false,
                notes: payload.notes ?? null,
                menu_item_slug: payload.name.toLowerCase()
            })
            .returning({
                id: ingredients.id,
                menu_item_id: ingredients.menu_item_id,
                name: ingredients.name,
                quantity: ingredients.quantity,
                unit: ingredients.unit,
                cost_cents: ingredients.cost_cents,
                allergen: ingredients.allergen,
                notes: ingredients.notes,
                created_at: ingredients.created_at,
            });

        const row = inserted[0];

        return NextResponse.json({
            ok: true,
            ingredient: {
                id: row.id,
                menu_item_id: row.menu_item_id,
                name: row.name,
                quantity: row.quantity,
                unit: row.unit,
                cost: Number(row.cost_cents) / 100,
                allergen: row.allergen,
                notes: row.notes,
                created_at: row.created_at,
            },
        });
    } catch (err: any) {
        console.error("[ingredients:create] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}
