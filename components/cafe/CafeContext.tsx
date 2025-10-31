"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cafe, Employee, Ingredient, MenuItem, Supplier } from "@/app/lib/types";
import { employees } from "@/app/lib/schema";
import { db } from "@/index";

type CafeContextValue = {

    // CAFE 

    cafe: Cafe | null;
    cafeLoading: boolean;
    cafeError: any;
    refetchCafe: () => Promise<void>;
    updateCafe: (data: Partial<Cafe>) => Promise<void>;


    menuItems: MenuItem[] | undefined;
    menuLoading: boolean;
    menuError: any;
    ingredients: Ingredient[] | undefined;
    ingredientsLoading: boolean;
    ingredientsError: any;
    refetchMenu: () => Promise<void>;
    refetchIngredients: () => Promise<void>;
    invalidateAll: () => Promise<void>;

    // ingredient & supplier helpers
    fetchIngredient: (slug: string) => Promise<Ingredient>;
    fetchSuppliers: (ingredientSlug: string) => Promise<Supplier[]>;
    invalidateIngredient: (ingredientSlug: string) => Promise<void>;
    invalidateIngredientSuppliers: (ingredientSlug: string) => Promise<void>;
    refetchCurrentIngredientSuppliers: () => Promise<void>;
    deleteCurrentIngredientSupplier: (supplierId: string) => Promise<void>;


    // current ingredient
    currentIngredient: Ingredient | null;
    currentIngredientLoading: boolean;
    currentIngredientError: any;
    setCurrentIngredientSlug: (slug: string | null) => void;

    // current ingredient suppliers
    currentIngredientSuppliers: Supplier[];
    currentIngredientSuppliersLoading: boolean;
    currentIngredientSuppliersError: any;

    // employees
    employees: Employee[];
    employeesLoading: boolean;
    employeesError: any;
    refetchEmployees: () => Promise<void>;
    createEmployee: (data: {
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        active?: boolean;
    }) => Promise<Employee>;

    currentEmployee: Employee | null | undefined,
    currentEmployeeLoading: boolean,
    currentEmployeeError: any,
    setCurrentEmployee: (id: number | null) => void,
    refetchCurrentEmployee: () => Promise<void>,
    needToWaitForEmployee: boolean,
    getEmployeeById: (id: number) => Promise<Employee | null>;

    // SUPPLIERS
    suppliers: Supplier[] | undefined; // suppliers for the cafe
    suppliersLoading: boolean;
    suppliersError: any;
    refetchSuppliers: () => Promise<void>;
    getSupplierById: (id: number) => Promise<Supplier | null>;
    deleteSupplier: (supplierId: number) => Promise<void>;

};

const CafeContext = createContext<CafeContextValue | undefined>(undefined);

export const CafeProvider = ({ children }: { children: React.ReactNode }) => {
    const qc = useQueryClient();
    const [currentSlug, setCurrentSlug] = React.useState<string | null>(null);
    const [needToWaitForEmployee, setNeedToWaitForEmployee] = useState(false)
    // 1) Cafe  
    const {
        data: cafe,
        isLoading: cafeLoading,
        error: cafeError,
        refetch: refetchCafeRaw,
    } = useQuery<Cafe | null>({
        queryKey: ["cafe", "current"],
        queryFn: async () => {
            const res = await fetch("/api/cafe");
            if (!res.ok) throw new Error((await res.json()).error || "Failed to load cafe");
            const json = await res.json();
            return json.cafe ?? null;
        },
        staleTime: 60_000,
        retry: 0,
    });

    const updateCafe = async (data: Partial<Cafe>) => {
        try {
            const res = await fetch("/api/cafe", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((r) => r.json());
            if (!res.ok) throw new Error(res.error || "Failed to update cafe");
        } catch (err: any) {
        }
    };


    // 2) Menu Items
    const {
        data: menuItems,
        isLoading: menuLoading,
        error: menuError,
        refetch: refetchMenuRaw,
    } = useQuery<MenuItem[]>({
        queryKey: ["cafe", cafe?.id ?? "no-cafe", "menu"],
        queryFn: async () => {
            if (!cafe?.id) return [];
            const res = await fetch(`/api/cafe/${cafe.id}/menu`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed to load menu");
            const json = await res.json();
            return json.items ?? [];
        },
        enabled: !!cafe?.id,
        staleTime: 30_000,
        retry: 0,
    });

    const refCafe = async (): Promise<void> => {
        await refetchCafe();
    }

    const refMenu = async (): Promise<void> => {
        await refetchMenu();
    }

    const refIng = async (): Promise<void> => {
        await refetchIngredients();
    }

    // 3) Ingredients
    const {
        data: ingredients,
        isLoading: ingredientsLoading,
        error: ingredientsError,
        refetch: refetchIngredientsRaw,
    } = useQuery<Ingredient[]>({
        queryKey: ["cafe", cafe?.id ?? "no-cafe", "ingredients"],
        queryFn: async () => {
            if (!cafe?.id) return [];
            const res = await fetch(`/api/cafe/${cafe.id}/ingredients`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed to load ingredients");
            const json = await res.json();
            return (json.ingredients ?? []).map((ing: any) => ({
                ...ing,
                menu_item_name: ing.menu_item?.name ?? undefined,
            }));
        },
        enabled: !!cafe?.id,
        staleTime: 30_000,
        retry: 0,
    });

    const {
        data: currentIngredientSuppliers,
        isLoading: currentIngredientSuppliersLoading,
        error: currentIngredientSuppliersError,
        refetch: refetchCurrentIngredientSuppliersRaw,
    } = useQuery<Supplier[]>({
        queryKey: ["ingredient", currentSlug, "suppliers"],
        queryFn: async () => {
            if (!currentSlug) return [];
            const res = await fetch(`/api/ingredients/${encodeURIComponent(currentSlug)}/suppliers`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch suppliers");
            const json = await res.json();
            return json.suppliers ?? [];
        },
        enabled: !!currentSlug,
        staleTime: 30_000,
        retry: 0,
    });

    // Refetch helper
    const refetchCurrentIngredientSuppliers = async (): Promise<void> => {
        if (currentSlug) await refetchCurrentIngredientSuppliersRaw();
    };


    // EMPLOYEES

    const {
        data: employees_,
        isLoading: isEmployeesLoading,
        error: employeesError,
        refetch: refetchEmployeesRaw
    } = useQuery<Employee[]>({
        queryKey: ["employees"],
        queryFn: async () => {
            const res = await fetch("/api/employees");
            if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch employees");
            const json = await res.json();
            return json.employees.map((row: any) => ({
                id: row.id,
                first_name: row.first_name ?? "",
                last_name: row.last_name ?? "",
                email: row.email ?? "",
                role: row.role ?? "",
                active: row.active ?? false,
                created_at: row.created_at ?? new Date().toISOString(),
            }));
        },
        staleTime: 30_000,
    });

    const refetchEmployees = async () => {
        await refetchEmployeesRaw();
    };

    const createEmployee = async (data: {
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        active?: boolean;
    }) => {
        const res = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || "Failed to create employee");
        }

        const json = await res.json();
        // Optionally refetch employees after creation
        await refetchEmployees();

        return json.employee as Employee;
    };

    const [currentEmployeeId, setCurrentEmployeeId] = React.useState<number | null>(null);

    // Fetch current employee
    const {
        data: currentEmployee,
        isLoading: currentEmployeeLoading,
        error: currentEmployeeError,
        refetch: refetchCurrentEmployeeRaw,
    } = useQuery<Employee | null>({
        queryKey: ["employee", currentEmployeeId],
        queryFn: async () => {
            setNeedToWaitForEmployee(true)
            console.log(currentEmployeeId)
            if (!currentEmployeeId) return null;
            const res = await fetch(`/api/employees/${currentEmployeeId}`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch employee");
            const json = await res.json();
            setNeedToWaitForEmployee(false)
            return json.employee;
        },
        enabled: currentEmployeeId != null,
        staleTime: 0,
        retry: 0

    });

    const setCurrentEmployee = (id: number | null) => {
        setCurrentEmployeeId(id);
    };

    const refetchCurrentEmployee = async () => {
        if (currentEmployeeId) await refetchCurrentEmployeeRaw();
    };


    const getEmployeeById = async (id: number): Promise<Employee | null> => {
        try {
            const res = await fetch(`/api/employees/${id}`);
            if (!res.ok) throw new Error("Failed to fetch employee");
            const json = await res.json();
            return json.employee ?? null;
        } catch (err) {
            console.error("getEmployeeById error:", err);
            return null;
        }
    };



    // SUPPLIERS

    const deleteCurrentIngredientSupplier = async (supplierId: string) => {
        if (!currentSlug) throw new Error("No current ingredient selected");
        if (!supplierId) throw new Error("Invalid supplier id");

        try {
            const res = await fetch(
                `/api/suppliers/${supplierId}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || "Failed to delete supplier");
            }

            // Refetch suppliers for the current ingredient
            await refetchCurrentIngredientSuppliers();
        } catch (err: any) {
            console.error("Failed to delete supplier:", err);
            throw err;
        }
    };

    const {
        data: suppliers,
        isLoading: suppliersLoading,
        error: suppliersError,
        refetch: refetchSuppliersRaw,
    } = useQuery<Supplier[]>({
        queryKey: ["cafe", cafe?.id ?? "no-cafe", "suppliers"],
        queryFn: async () => {
            if (!cafe?.id) return [];
            const res = await fetch(`/api/cafe/${cafe.id}/suppliers`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed to load suppliers");
            const json = await res.json();
            return json.suppliers ?? [];
        },
        enabled: !!cafe?.id,
        staleTime: 30_000,
        retry: 0,
    });

    const refetchSuppliers = async (): Promise<void> => {
        await refetchSuppliersRaw();
    };

    const getSupplierById = async (id: number) => {
        if (!id) throw new Error("invalid supplier id");

        const res = await fetch(`/api/suppliers/${id}`);
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || "Failed to fetch supplier");
        }
        const json = await res.json();
        if (!json.ok) throw new Error(json?.error || "No supplier returned");
        return json.supplier as any; // you can cast to Supplier if you have the type imported
    };

    const deleteSupplier = async (id: number): Promise<void> => {
        if (!id) throw new Error("Invalid supplier id");

        try {
            const res = await fetch(`/api/suppliers/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || "Failed to delete supplier");
            }

            // Invalidate relevant caches
            await qc.invalidateQueries({ queryKey: ["suppliers"] });
            await qc.invalidateQueries({ queryKey: ["ingredient"] });
            await qc.invalidateQueries({ queryKey: ["cafe"] });
        } catch (err: any) {
            console.error("Failed to delete supplier:", err);
            throw err;
        }
    };




    // 4) Current Ingredient (by slug)
    const {
        data: currentIngredient,
        isLoading: currentIngredientLoading,
        error: currentIngredientError,
    } = useQuery<Ingredient | null>({
        queryKey: ["ingredient", currentSlug],
        queryFn: async () => {
            if (!currentSlug) return null;
            const res = await fetch(`/api/ingredient/${encodeURIComponent(currentSlug)}`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch ingredient");
            const json = await res.json();
            return json.ingredient ?? null;
        },
        enabled: !!currentSlug,
        staleTime: 30_000,
        retry: 0,
    });

    // Helpers
    const fetchIngredient = async (slug: string) => {
        if (!slug) throw new Error("invalid ingredient slug");
        return qc.fetchQuery<Ingredient>({
            queryKey: ["ingredient", slug],
            queryFn: async () => {
                const res = await fetch(`/api/ingredients/${encodeURIComponent(slug)}`);
                if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch ingredient");
                const json = await res.json();
                return json.ingredient;
            },
            staleTime: 30_000,
            retry: 0,
        });
    };

    const fetchSuppliers = async (ingredientSlug: string) => {
        if (!ingredientSlug) return [];
        return qc.fetchQuery<Supplier[]>({
            queryKey: ["ingredient", ingredientSlug, "suppliers"],
            queryFn: async () => {
                const res = await fetch(`/api/ingredients/${encodeURIComponent(ingredientSlug)}/suppliers`);
                if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch suppliers");
                const json = await res.json();
                return json.suppliers ?? [];
            },
            staleTime: 30_000,
            retry: 0,
        });
    };

    const invalidateIngredient = async (ingredientSlug: string) => {
        await qc.invalidateQueries({ queryKey: ["ingredient", ingredientSlug] });
    };

    // Inside CafeProvider, after other helpers:



    const invalidateIngredientSuppliers = async (ingredientSlug: string) => {
        await qc.invalidateQueries({ queryKey: ["ingredient", ingredientSlug, "suppliers"] });
    };

    const refetchCafe = async () => await refetchCafeRaw();
    const refetchMenu = async () => await refetchMenuRaw();
    const refetchIngredients = async () => await refetchIngredientsRaw();
    const invalidateAll = async () => {
        await Promise.all([
            qc.invalidateQueries({ queryKey: ["cafe", "current"] }),
            qc.invalidateQueries({ queryKey: ["cafe"] }),
            qc.invalidateQueries({ queryKey: ["cafe", cafe?.id ?? "no-cafe"] }),
        ]);
    };


    const value = useMemo(
        () => ({
            // CAFE
            updateCafe,
            cafe: cafe ?? null,
            cafeLoading,
            cafeError,
            menuItems,
            menuLoading,
            menuError,
            ingredients,
            ingredientsLoading,
            ingredientsError,
            refetchCafe: refCafe,
            refetchMenu: refMenu,
            refetchIngredients: refIng,
            invalidateAll,

            // helpers
            fetchIngredient,
            fetchSuppliers,
            invalidateIngredient,
            invalidateIngredientSuppliers,
            deleteCurrentIngredientSupplier,


            // current ingredient
            currentIngredient: currentIngredient ?? null,
            currentIngredientLoading,
            currentIngredientError,
            setCurrentIngredientSlug: setCurrentSlug,

            currentIngredientSuppliers: currentIngredientSuppliers ?? [],
            currentIngredientSuppliersLoading,
            currentIngredientSuppliersError,
            refetchCurrentIngredientSuppliers,

            // EMPLOYEES
            employees: employees_ ?? [],
            employeesLoading: isEmployeesLoading,
            employeesError: employeesError,
            refetchEmployees: refetchEmployees,
            createEmployee,
            currentEmployee,
            currentEmployeeLoading,
            currentEmployeeError,
            setCurrentEmployee,
            refetchCurrentEmployee,
            needToWaitForEmployee,
            getEmployeeById,


            // SUPPLIERS
            suppliers,
            suppliersError,
            suppliersLoading,
            refetchSuppliers,
            getSupplierById,
            deleteSupplier
        }),
        [
            cafe,
            cafeLoading,
            cafeError,
            menuItems,
            menuLoading,
            menuError,
            ingredients,
            ingredientsLoading,
            ingredientsError,
            currentIngredient,
            currentIngredientLoading,
            currentIngredientError,
            currentIngredientSuppliers,
            currentIngredientSuppliersLoading,
            currentIngredientSuppliersError,
            employees_
        ]
    );

    return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
};

export const useCafe = () => {
    const ctx = useContext(CafeContext);
    if (!ctx) throw new Error("useCafe must be used inside CafeProvider");
    return ctx;
};
