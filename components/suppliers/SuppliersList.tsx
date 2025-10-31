"use client";

import React from "react";
import SupplierCard, { Supplier } from "./SupplierCard";

interface SuppliersListProps {
    suppliers: Supplier[];
}

export default function SuppliersList({ suppliers }: SuppliersListProps) {
    return (
        <div className="grid gap-3">
            {suppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} />
            ))}
        </div>
    );
}
