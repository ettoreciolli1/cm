import { NextRequest, NextResponse } from "next/server";
import { db } from "@/."; // adjust your import
import { employees } from "@/app/lib/schema"; // Drizzle schema
import z from "zod";

export async function GET(req: NextRequest) {
    try {
        const rows = await db.select().from(employees);

        // Return employees
        return NextResponse.json({ employees: rows });
    } catch (err: any) {
        console.error("[api/employees]", err);
        return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
    }
}

const createEmployeeSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    role: z.string().min(1),
    active: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createEmployeeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
        }

        const inserted = await db.insert(employees).values(parsed.data).returning();
        return NextResponse.json({ employee: inserted[0] });
    } catch (err: any) {
        console.error("[api/employees POST]", err);
        return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
    }
}
