"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCafe } from "@/components/cafe/CafeContext";
import type { Employee } from "@/app/lib/types";

export default function EmployeePage() {
    const { id } = useParams();
    const { getEmployeeById } = useCafe();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            const data = await getEmployeeById(Number(id));
            if (!data) setError("Employee not found");
            setEmployee(data);
            setLoading(false);
        };
        load();
    }, [id, getEmployeeById]);

    if (loading) return <div className="p-6 text-black">Loading employee…</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!employee) return <div className="p-6 text-black">No employee found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 text-black bg-white">
            <h1 className="text-2xl font-bold mb-2">
                {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-700">{employee.email}</p>
            <p className="text-gray-600">{employee.role}</p>
            <p className="mt-2">{employee.active ? "Active" : "Inactive"}</p>
            <p className="text-sm text-gray-500">
                Created: {new Date(employee.created_at).toLocaleString()}
            </p>
        </div>
    );
}
