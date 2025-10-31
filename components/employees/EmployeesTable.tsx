"use client";

import React from "react";
import EmployeeCard, { Employee } from "./EmployeeCard";

interface EmployeesTableProps {
    employees: Employee[];
    onRowClick: (id: number) => void;
}

export default function EmployeesTable({ employees, onRowClick }: EmployeesTableProps) {
    return (
        <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Active</th>
                    <th className="p-2 text-left">Created At</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((e) => (
                    <EmployeeCard key={e.id} employee={e} onClick={onRowClick} />
                ))}
            </tbody>
        </table>
    );
}
