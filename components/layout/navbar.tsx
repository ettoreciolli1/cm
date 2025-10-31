"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Ingredients", href: "/ingredients" },
    { name: "Suppliers", href: "/suppliers" },
    { name: "Employees", href: "/employees" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="bg-black text-white px-6 py-3 flex justify-between items-center">
            <div className="font-bold text-lg">☕ Cafe Manager</div>
            <ul className="flex space-x-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`hover:text-gray-300 transition ${isActive ? "underline underline-offset-4" : ""
                                    }`}
                            >
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
