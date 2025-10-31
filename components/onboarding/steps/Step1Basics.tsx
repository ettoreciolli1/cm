// components/onboarding/steps/Step1Basics.tsx
"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useZodForm } from "./_helpers";
import { useOnboarding } from "../OnboardingContext";

const schema = z.object({
    name: z.string().min(2, "Cafe name too short"),
    slug: z
        .string()
        .min(2, "Slug too short")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
});

type FormValues = z.infer<typeof schema>;

export default function Step1Basics() {
    const { data, update, setCompletedStep } = useOnboarding();
    const { register, handleSubmit, formState, reset } = useZodForm<FormValues>(schema, {
        defaultValues: {
            name: data.name ?? "",
            slug: data.slug ?? "",
        },
    });

    useEffect(() => {
        reset({
            name: data.name ?? "",
            slug: data.slug ?? "",
        });
    }, [data, reset]);

    const onSubmit = (values: FormValues) => {
        update(values);
        setCompletedStep(0, true);
    };

    const { errors, isValid } = formState;

    return (
        <form onBlur={handleSubmit(onSubmit)} className="space-y-4 text-black font-gummy">
            <div>
                <label className="block text-sm font-medium text-black">Cafe name</label>
                <input {...register("name")} className="w-full border p-2 rounded" />
                {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium text-black">URL slug (lowercase, hyphens)</label>
                <input {...register("slug")} className="w-full border p-2 rounded" />
                {errors.slug && <div className="text-sm text-red-600">{errors.slug.message}</div>}
            </div>

            <div className="text-sm text-gray-500">Tip: Slug will be used in URLs like /store/your-slug</div>

            <div className="mt-4">
                <div className={isValid ? "text-green-600" : "text-gray-500"}>
                    {isValid ? "Step ready — click Next" : "Complete required fields to finish this step."}
                </div>
            </div>
        </form>
    );
}
