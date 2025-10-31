// app/actions/completeOnboarding.ts
"use server";

import { z } from "zod";
import { db } from "@/.";
import { cafes, user as userTable } from "@/app/lib/schema";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

const onboardingSchema = z.object({
    name: z.string().min(2).max(300),
    slug: z.string().min(2).max(320).regex(/^[a-z0-9-]+$/),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    opening_hours: z.string().nullable().optional(),
    pos_enabled: z.boolean().optional().default(true),
    // optionally other fields collected across steps
});

export async function completeOnboardingAction(payload: unknown) {
    // Validate payload
    const parsed = onboardingSchema.parse(payload);

    // Server side session via Better Auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const ownerId = session.user.id;

    // Ensure owner hasn't already created a cafe (unique constraint)
    const existing = await db
        .select()
        .from(cafes)
        .where(eq(cafes.owner_id, ownerId))
        .limit(1);

    if (existing.length > 0) {
        throw new Error("Owner already has a cafe");
    }

    // Insert new cafe
    const inserted = await db
        .insert(cafes)
        .values({
            name: parsed.name,
            slug: parsed.slug,
            owner_id: ownerId,
            address: parsed.address ?? null,
            city: parsed.city ?? null,
            country: parsed.country ?? null,
            phone: parsed.phone ?? null,
            timezone: parsed.timezone ?? null,
            opening_hours: parsed.opening_hours ?? null,
            pos_enabled: parsed.pos_enabled ?? true,
        })
        .returning({
            id: cafes.id,
            name: cafes.name,
            slug: cafes.slug,
            owner_id: cafes.owner_id,
            created_at: cafes.created_at,
        });

    // Mark user has_onboarded = true
    await db
        .update(userTable)
        .set({ hasOnboarded: true })
        .where(eq(userTable.id, ownerId));

    return {
        ok: true,
        cafe: inserted[0],
    };
}
