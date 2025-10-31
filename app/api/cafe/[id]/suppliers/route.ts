import { NextRequest, NextResponse } from "next/server";
import { db } from "@/index"; // adjust path to your db export
import { cafes, menu_items, ingredients, suppliers } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { Supplier } from "@/app/lib/types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // await params as requested (params is already available in app router)
        const p = params as { id?: string };
        const cafeId = Number(p.id);
        if (!p.id || Number.isNaN(cafeId)) {
            return NextResponse.json({ error: "invalid_cafe_id" }, { status: 400 });
        }

        // Single joined query: cafes -> menu_items -> ingredients -> suppliers
        // We select supplier fields and the ingredient/menu_item ids just so join works/validation occurs.
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
            .from(cafes)
            .innerJoin(menu_items, eq(menu_items.cafe_id, cafes.id))
            .innerJoin(ingredients, eq(ingredients.menu_item_id, menu_items.id))
            .innerJoin(suppliers, eq(suppliers.ingredient_id, ingredients.id))
            .where(eq(cafes.id, cafeId));

        // Map DB rows to your Supplier interface shape
        const suppliersPayload: Supplier[] = (rows ?? []).map((r: any) => ({
            id: r.id as number,
            ingredient_id: r.ingredient_id as number,
            name: r.name as string,
            contact: r.contact ?? null,
            website: r.website ?? null,
            unit_price: r.unit_price_cents != null ? Number(r.unit_price_cents) / 100 : null,
            unit: r.unit ?? null,
            lead_time_days: r.lead_time_days ?? null,
            preferred: Boolean(r.preferred),
            notes: r.notes ?? null,
            created_at: (r.created_at ? new Date(r.created_at).toISOString() : null) as string | undefined,
            updated_at: (r.updated_at ? new Date(r.updated_at).toISOString() : null) as string | undefined,
        }));

        return NextResponse.json({ suppliers: suppliersPayload }, { status: 200 });
    } catch (err: any) {
        console.error("[GET /api/cafe/[id]/suppliers] error:", err);
        return NextResponse.json({ error: err?.message ?? "server_error" }, { status: 500 });
    }
}
