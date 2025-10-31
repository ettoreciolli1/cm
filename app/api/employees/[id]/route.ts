import { NextRequest, NextResponse } from "next/server";
import { db } from "@/."; // adjust import
import { employees } from "@/app/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt((await params).id);
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

        const row = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
        if (!row[0]) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

        return NextResponse.json({ employee: row[0] });
    } catch (err: any) {
        console.error("[api/employees/[id] GET]", err);
        return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

        const deleted = await db.delete(employees).where(eq(employees.id, id)).returning();
        if (!deleted[0]) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

        return NextResponse.json({ employee: deleted[0] });
    } catch (err: any) {
        console.error("[api/employees/[id] DELETE]", err);
        return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
    }
}
