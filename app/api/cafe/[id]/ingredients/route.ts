// app/api/cafe/[id]/ingredients/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/.";
import { cafes, menu_items, ingredients } from "@/app/lib/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        // session
        const p = params;
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const userId = session.user.id;

        // parse cafe id
        const cafeId = Number(p.id);
        if (!cafeId || Number.isNaN(cafeId)) {
            return NextResponse.json({ ok: false, error: "invalid_cafe_id" }, { status: 400 });
        }

        // verify ownership: make sure the cafe belongs to this user
        const cafeRow = await db
            .select({ id: cafes.id })
            .from(cafes)
            .where(and(eq(cafes.id, cafeId), eq(cafes.owner_id, userId)))
            .limit(1)
            .then((r: any[]) => r[0]);

        if (!cafeRow) {
            return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        // select ingredients joined with menu_items (so we can filter by cafe_id)
        const rows = await db
            .select({
                id: ingredients.id,
                menu_item_id: ingredients.menu_item_id,
                menu_item_slug: ingredients.menu_item_slug,
                menu_item_name: menu_items.name,
                name: ingredients.name,
                quantity: ingredients.quantity,
                unit: ingredients.unit,
                cost_cents: ingredients.cost_cents,
                allergen: ingredients.allergen,
                notes: ingredients.notes,
                created_at: ingredients.created_at,
                updated_at: ingredients.updated_at,
            })
            .from(ingredients)
            .leftJoin(menu_items, eq(menu_items.id, ingredients.menu_item_id))
            .where(eq(menu_items.cafe_id, cafeId))
            .orderBy(sql`${ingredients.created_at} DESC`)
            .limit(2000);

        const payload = rows.map((r: any) => ({
            id: r.id,
            menu_item_id: r.menu_item_id,
            menu_item_slug: r.menu_item_slug,
            menu_item_name: r.menu_item_name,
            name: r.name,
            quantity: r.quantity ?? null,
            unit: r.unit ?? null,
            cost: r.cost_cents != null ? Number(r.cost_cents) / 100 : 0,
            allergen: Boolean(r.allergen),
            notes: r.notes ?? null,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }));

        return NextResponse.json({ ok: true, ingredients: payload });
    } catch (err: any) {
        console.error("[api/cafe/[id]/ingredients] error:", err);
        return NextResponse.json(
            { ok: false, error: err?.message ?? "server_error" },
            { status: 500 }
        );
    }
}
