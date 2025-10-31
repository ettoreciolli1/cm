"use client";

import React, { useCallback, useEffect } from "react";
import { useCafe } from "@/components/cafe/CafeContext";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuGrid from "@/components/menu/MenuGrid";
import AddMenuItemPanel from "@/components/menu/AddMenuItemPanel";

export default function MenuPageClient() {
    const {
        cafe,
        cafeLoading,
        cafeError,
        menuItems,
        menuLoading,
        menuError,
        refetchMenu,
        invalidateAll,
    } = useCafe();

    const onItemCreated = useCallback(async () => {
        // prefer invalidation so all queries refresh consistently
        if (invalidateAll) {
            await invalidateAll();
        } else {
            await refetchMenu();
        }
    }, [invalidateAll, refetchMenu]);

    useEffect(() => {
        // ensure menu is loaded once cafe is known — context query is enabled but this is safe
        refetchMenu().catch(() => { });
    }, [refetchMenu]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <MenuHeader cafe={cafe} loading={cafeLoading} error={cafeError} />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <MenuGrid
                            items={menuItems}
                            loading={menuLoading}
                            error={menuError}
                        />
                    </div>

                    <aside className="space-y-4">
                        <AddMenuItemPanel onCreated={onItemCreated} />
                        <div className="bg-white p-4 rounded-2xl shadow">
                            <h3 className="text-sm font-medium text-gray-700">Tips</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Keep titles clear, add an image URL for nicer cards, and set prices as cents in the DB.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
