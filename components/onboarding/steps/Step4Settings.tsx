// components/onboarding/steps/Step4Settings.tsx
"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useZodForm } from "./_helpers";
import { useOnboarding } from "../OnboardingContext";

const schema = z.object({
    opening_hours: z.string().min(3).optional().nullable(),
    pos_enabled: z.boolean().optional().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function Step4Settings() {
    const { data, update, setCompletedStep } = useOnboarding();
    const { register, handleSubmit, formState, reset } = useZodForm<FormValues>(schema, {
        defaultValues: {
            opening_hours: data.opening_hours ?? "",
            pos_enabled: data.pos_enabled ?? true,
        },
    });

    useEffect(() => {
        reset({
            opening_hours: data.opening_hours ?? "",
            pos_enabled: data.pos_enabled ?? true,
        });
    }, [data, reset]);

    const onSubmit = (values: FormValues) => {
        update(values);
        setCompletedStep(3, true);
    };

    const { errors, isValid } = formState;

    return (
        <form onBlur={handleSubmit(onSubmit)} className="space-y-4 text-black font-gummy">
            <div>
                <label className="block text-sm font-medium font-gummy">Opening hours (free format)</label>
                <textarea {...register("opening_hours")} className="w-full border p-2 rounded" rows={4} />
                {errors.opening_hours && <div className="text-sm text-red-600">{errors.opening_hours.message}</div>}
            </div>

            <div className="flex items-center gap-3">
                <input type="checkbox" {...register("pos_enabled")} />
                <div>
                    <div className="font-medium">Enable POS</div>
                    <div className="text-sm text-gray-500">Turn on point-of-sale features</div>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">{isValid ? "Step ready" : "Fill required data"}</div>
        </form>
    );
}
