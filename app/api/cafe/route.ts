// app/api/cafe/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/.";
import { cafes } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { Cafe } from "@/app/lib/types";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
        }

        const ownerId = session.user.id;

        const rows = await db
            .select({
                id: cafes.id,
                name: cafes.name,
                slug: cafes.slug,
                owner_id: cafes.owner_id,
                address: cafes.address,
                city: cafes.city,
                country: cafes.country,
                phone: cafes.phone,
                timezone: cafes.timezone,
                opening_hours: cafes.opening_hours,
                pos_enabled: cafes.pos_enabled,
                created_at: cafes.created_at,
                updated_at: cafes.updated_at,
            })
            .from(cafes)
            .where(eq(cafes.owner_id, ownerId))
            .limit(1);

        const cafe: Cafe | null = rows[0] ?? null;

        return NextResponse.json({ ok: true, cafe });
    } catch (err: any) {
        console.error("[api/cafe] error:", err);
        return NextResponse.json(
            { ok: false, error: err?.message ?? "server_error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user?.id) return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });

        const body = await req.json();
        const { name, address, phone } = body;

        if (!name) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });

        const updatedCafe = await db
            .update(cafes)
            .set({ name, address, phone })
            .where(eq(cafes.owner_id, session.user.id))
            .returning()
            .then((r) => r[0]);

        return NextResponse.json({ ok: true, cafe: updatedCafe });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
