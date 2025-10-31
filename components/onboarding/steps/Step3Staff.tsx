// components/onboarding/steps/Step3Staff.tsx
"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useZodForm } from "./_helpers";
import { useOnboarding } from "../OnboardingContext";

const schema = z.object({
    manager_name: z.string().min(2).optional().nullable(),
    initial_staff_count: z.number().min(0).max(1000).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function Step3Staff() {
    const { data, update, setCompletedStep } = useOnboarding();
    const { register, handleSubmit, formState, reset, setValue } = useZodForm<FormValues>(schema, {
        defaultValues: {
            manager_name: (data as any).manager_name ?? "",
            initial_staff_count: (data as any).initial_staff_count ?? 0,
        },
    });

    useEffect(() => {
        reset({
            manager_name: (data as any).manager_name ?? "",
            initial_staff_count: (data as any).initial_staff_count ?? 0,
        });
    }, [data, reset]);

    const onSubmit = (values: FormValues) => {
        update(values as any);
        setCompletedStep(2, true);
    };

    const { errors, isValid } = formState;

    return (
        <form onBlur={handleSubmit(onSubmit)} className="space-y-4 text-black">
            <div>
                <label className="block text-sm font-medium">Manager name</label>
                <input {...register("manager_name")} className="w-full border p-2 rounded" />
                {errors.manager_name && <div className="text-sm text-red-600">{errors.manager_name.message}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium">Initial staff count</label>
                <input
                    type="number"
                    {...register("initial_staff_count", { valueAsNumber: true })}
                    className="w-32 border p-2 rounded"
                />
                {errors.initial_staff_count && <div className="text-sm text-red-600">{errors.initial_staff_count.message}</div>}
            </div>

            <div className="mt-4 text-sm text-gray-500">{isValid ? "Step ready" : "Fill required data"}</div>
        </form>
    );
}
