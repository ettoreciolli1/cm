"use client";

import { CafeProvider } from "@/components/cafe/CafeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <CafeProvider>
                <div className="bg-white min-h-dvh flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </CafeProvider>
        </QueryClientProvider>
    );
}
