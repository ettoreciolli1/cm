// app/(protected)/layout.tsx  (server component)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth"; // Better Auth helper
import type { ReactNode } from "react";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });

    // If not authenticated -> send to sign in
    if (!session?.user?.id) {
        // Use redirect so user never sees the protected page content
        redirect("/auth/login"); // or wherever your sign-in lives
    }

    // optionally you can check additional claims/flags (e.g. has_onboarded)
    if (!session.user.hasOnboarded) redirect('/onboarding')

    return <>{children}</>;
}
