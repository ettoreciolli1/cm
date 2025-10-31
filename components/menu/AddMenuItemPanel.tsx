"use client";

import React from "react";
import AddMenuItemForm from "@/components/menu/AddMenuItemForm";

export default function AddMenuItemPanel({ onCreated }: { onCreated: () => void }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-3">Create menu item</h3>
            {/* Your existing form component — pass onCreated if it supports it */}
            <AddMenuItemForm onCreated={onCreated} />
        </div>
    );
}
