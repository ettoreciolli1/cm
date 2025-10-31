// app/api/internal/onboarding/complete/route.ts
import { NextResponse } from "next/server";
import { completeOnboardingAction } from "@/app/actions/completeOnboarding";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const result = await completeOnboardingAction(payload);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("onboarding complete error", err);
        return NextResponse.json({ error: err.message ?? "Failed" }, { status: 400 });
    }
}
