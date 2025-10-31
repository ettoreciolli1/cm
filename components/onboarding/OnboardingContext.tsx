// components/onboarding/OnboardingContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type OnboardData = {
    name?: string;
    slug?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    timezone?: string;
    opening_hours?: string;
    pos_enabled?: boolean;
    // extend with other fields per-step
};

type OnboardingContextValue = {
    step: number;
    setStep: (n: number) => void;
    next: () => void;
    back: () => void;
    data: OnboardData;
    update: (patch: Partial<OnboardData>) => void;
    reset: () => void;
    stepsCount: number;
    completedSteps: boolean[]; // for marking sections completed
    setCompletedStep: (index: number, done: boolean) => void;
};

const StepsCount = 4; // number of steps

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
    const [step, setStepState] = useState(1);
    const [data, setData] = useState<OnboardData>({});
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(
        Array(StepsCount).fill(false)
    );

    const setStep = (n: number) => {
        if (n < 1) n = 1;
        if (n > StepsCount) n = StepsCount;
        setStepState(n);
    };

    const next = () => setStep(Math.min(StepsCount, step + 1));
    const back = () => setStep(Math.max(1, step - 1));
    const update = (patch: Partial<OnboardData>) => setData((d) => ({ ...d, ...patch }));
    const reset = () => {
        setData({});
        setStepState(1);
        setCompletedSteps(Array(StepsCount).fill(false));
    };

    const setCompletedStep = (index: number, done: boolean) => {
        setCompletedSteps((prev) => {
            const copy = [...prev];
            copy[index] = done;
            return copy;
        });
    };

    const value = useMemo(
        () => ({
            step,
            setStep,
            next,
            back,
            data,
            update,
            reset,
            stepsCount: StepsCount,
            completedSteps,
            setCompletedStep,
        }),
        [step, data, completedSteps]
    );

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
    const ctx = useContext(OnboardingContext);
    if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
    return ctx;
};
