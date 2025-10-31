// components/onboarding/steps/Step2Location.tsx
"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useZodForm } from "./_helpers";
import { useOnboarding } from "../OnboardingContext";

const schema = z.object({
    address: z.string().min(3, "Enter address").optional().optional(),
    city: z.string().min(2, "Enter city").optional().optional(),
    country: z.string().min(2, "Enter country").optional().optional(),
    timezone: z.string().optional().nullable(),
});

interface OnboardData {
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;
}


type FormValues = z.infer<typeof schema>;

export default function Step2Location() {
    const { data, update, setCompletedStep } = useOnboarding();
    const { register, handleSubmit, formState, reset } = useZodForm<FormValues>(schema, {
        defaultValues: {
            address: data.address ?? "",
            city: data.city ?? "",
            country: data.country ?? "",
            timezone: data.timezone ?? "",
        },
    });

    useEffect(() => {
        reset({
            address: data.address ?? "",
            city: data.city ?? "",
            country: data.country ?? "",
            timezone: data.timezone ?? "",
        });
    }, [data, reset]);

    const onSubmit = (values: FormValues) => {
        const sanitized: Partial<OnboardData> = {
            address: values.address ?? undefined,
            city: values.city ?? undefined,
            country: values.country ?? undefined,
            timezone: values.timezone ?? undefined,
        };

        update(sanitized); // Now all nulls are undefined
        setCompletedStep(1, true);
    };



    const { errors, isValid } = formState;

    return (
        <form onBlur={handleSubmit(onSubmit)} className="space-y-4 text-black font-gummy">
            <div>
                <label className="block text-sm font-medium">Address</label>
                <input {...register("address")} className="w-full border p-2 rounded" />
                {errors.address && <div className="text-sm text-red-600">{errors.address.message}</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">City</label>
                    <input {...register("city")} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Country</label>
                    <input {...register("country")} className="w-full border p-2 rounded" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Timezone (e.g. Europe/Berlin)</label>
                <input {...register("timezone")} className="w-full border p-2 rounded" />
            </div>

            <div className="mt-4 text-sm text-gray-500">{isValid ? "Step ready" : "Fill required data"}</div>
        </form>
    );
}
