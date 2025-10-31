// app/api/suppliers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/index"; // adjust to your db export
import { suppliers, ingredients, menu_items, cafes } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/lib/auth"; // your better-auth helper
import { Supplier } from "@/app/lib/types";

export async function GET(req: NextRequest, { params }: { params: { id?: string } }) {
    try {
        const p = params;
        const supplierId = Number(p.id);
        if (!p.id || Number.isNaN(supplierId)) {
            return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
        }

        // session + ownership check
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const userId = session.user.id;

        // join suppliers -> ingredients -> menu_items -> cafes
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
                // extra context
                ingredient_name: ingredients.name,
                menu_item_id: menu_items.id,
                menu_item_name: menu_items.name,
                menu_item_slug: menu_items.slug,
                cafe_id: cafes.id,
                cafe_owner_id: cafes.owner_id,
            })
            .from(suppliers)
            .leftJoin(ingredients, eq(suppliers.ingredient_id, ingredients.id))
            .leftJoin(menu_items, eq(ingredients.menu_item_id, menu_items.id))
            .leftJoin(cafes, eq(menu_items.cafe_id, cafes.id))
            .where(eq(suppliers.id, supplierId))
            .limit(1);

        const row = rows && rows[0];
        if (!row) {
            return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
        }

        // ensure ownership
        if (!row.cafe_owner_id || String(row.cafe_owner_id) !== String(userId)) {
            return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        const supplier: Supplier = {
            id: Number(row.id),
            ingredient_id: Number(row.ingredient_id),
            name: row.name as string,
            contact: row.contact ?? null,
            website: row.website ?? null,
            unit_price: row.unit_price_cents != null ? Number(row.unit_price_cents) / 100 : null,
            unit: row.unit ?? null,
            lead_time_days: row.lead_time_days ?? null,
            preferred: Boolean(row.preferred),
            notes: row.notes ?? null,
            created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
        };

        return NextResponse.json({ ok: true, supplier }, { status: 200 });
    } catch (err: any) {
        console.error("[api/suppliers/[id] GET] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id?: string } }) {
    try {
        const p = await params;
        const supplierId = Number(p.id);
        if (!p.id || Number.isNaN(supplierId)) {
            return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
        }

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }
        const userId = session.user.id;

        // Verify ownership the same way as GET
        const ownerRows = await db
            .select({ cafe_owner_id: cafes.owner_id })
            .from(suppliers)
            .leftJoin(ingredients, eq(suppliers.ingredient_id, ingredients.id))
            .leftJoin(menu_items, eq(ingredients.menu_item_id, menu_items.id))
            .leftJoin(cafes, eq(menu_items.cafe_id, cafes.id))
            .where(eq(suppliers.id, supplierId))
            .limit(1);

        const ownerRow = ownerRows && ownerRows[0];
        if (!ownerRow || String(ownerRow.cafe_owner_id) !== String(userId)) {
            return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        await db.delete(suppliers).where(eq(suppliers.id, supplierId));

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err: any) {
        console.error("[api/suppliers/[id] DELETE] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "server_error" }, { status: 500 });
    }
}
