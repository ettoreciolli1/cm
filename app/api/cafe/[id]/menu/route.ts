import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/.";
import { cafes, menu_items } from "@/app/lib/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/cafe/[id]/menu
 * Returns all menu items for the cafe if the user owns it
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const p = await params;
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }

        const cafeId = Number(p.id);
        const userId = session.user.id;

        // Verify cafe ownership
        const cafe = await db
            .select({ id: cafes.id })
            .from(cafes)
            .where(and(eq(cafes.id, cafeId), eq(cafes.owner_id, userId)))
            .limit(1)
            .then((r: any[]) => r[0]);

        if (!cafe) {
            return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        // Fetch menu items for this cafe
        const items = await db
            .select({
                id: menu_items.id,
                name: menu_items.name,
                slug: menu_items.slug,
                description: menu_items.description,
                price_cents: menu_items.price_cents,
                currency: menu_items.currency,
                available: menu_items.available,
                category: menu_items.category,
                image_url: menu_items.image_url,
                created_at: menu_items.created_at,
            })
            .from(menu_items)
            .where(eq(menu_items.cafe_id, cafeId))
            .orderBy(sql`${menu_items.created_at} DESC`);

        return NextResponse.json({ ok: true, items });
    } catch (err: any) {
        console.error("[api/cafe/[id]/menu] error:", err);
        return NextResponse.json(
            { ok: false, error: err?.message ?? "server_error" },
            { status: 500 }
        );
    }
}
