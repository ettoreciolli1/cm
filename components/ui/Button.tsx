"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

type ButtonProps = {
    label?: string;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
};

export default function Button({
    label,
    children,
    onClick,
    type = "button",
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    icon,
    className = "",
}: ButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-black text-white hover:bg-gray-800",
        secondary: "bg-indigo-600 text-white hover:bg-indigo-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 text-gray-800 hover:bg-gray-50",
        ghost: "text-gray-700 hover:bg-gray-100",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
    };

    return (
        <motion.button
            whileHover={!disabled && !loading ? { scale: 1.03 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={clsx(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    {label || children}
                </>
            )}
        </motion.button>
    );
}
