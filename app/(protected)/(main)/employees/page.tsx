"use client";

import React, { useEffect, useState } from "react";
import { useCafe } from "@/components/cafe/CafeContext";
import EmployeesTable from "@/components/employees/EmployeesTable";

export default function EmployeesPage() {
    const { employees, employeesLoading, employeesError, refetchEmployees, createEmployee, setCurrentEmployee } = useCafe();
    const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", role: "", active: true });
    const [formError, setFormError] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { refetchEmployees(); }, [refetchEmployees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormLoading(true);
        try {
            await createEmployee(formData);
            await refetchEmployees();
            setFormData({ first_name: "", last_name: "", email: "", role: "", active: true });
        } catch (err: any) {
            setFormError(err.message);
        } finally { setFormLoading(false); }
    };

    const handleRowClick = (id: number) => {
        setCurrentEmployee(id);
        location.href = `/employees/${id}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-6 text-black bg-white space-y-6">
            <h1 className="text-2xl font-bold">Employees</h1>

            {/* Add Employee Form */}
            <section className="p-4 border border-gray-300 rounded space-y-2">
                <h2 className="font-semibold">Add Employee</h2>
                {formError && <div className="text-red-600">{formError}</div>}
                <form onSubmit={handleSubmit} className="grid gap-2">
                    <input className="border p-2 w-full" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
                    <input className="border p-2 w-full" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
                    <input className="border p-2 w-full" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <input className="border p-2 w-full" placeholder="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
                        <span>Active</span>
                    </label>
                    <button className="bg-black text-white px-4 py-2 rounded" type="submit" disabled={formLoading}>
                        {formLoading ? "Creating…" : "Create Employee"}
                    </button>
                </form>
            </section>

            {/* Employees Table */}
            {employeesLoading ? <div>Loading employees…</div> :
                employeesError ? <div className="text-red-600">Error: {(employeesError as any)?.message}</div> :
                    employees.length === 0 ? <div>No employees found.</div> :
                        <EmployeesTable employees={employees} onRowClick={handleRowClick} />}
        </div>
    );
}
