"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    active: boolean;
    created_at: string;
}

interface EmployeeCardProps {
    employee: Employee;
    onClick: (id: number) => void;
}

export default function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
    return (
        <motion.tr
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
            onClick={() => onClick(employee.id)}
        >
            <td className="p-2">{employee.id}</td>
            <td className="p-2">{employee.first_name} {employee.last_name}</td>
            <td className="p-2">{employee.email}</td>
            <td className="p-2">{employee.role}</td>
            <td className="p-2">{employee.active ? "Yes" : "No"}</td>
            <td className="p-2">{new Date(employee.created_at).toLocaleDateString()}</td>
        </motion.tr>
    );
}
