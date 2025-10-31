// components/onboarding/OnboardingShell.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "./OnboardingContext";
import clsx from "clsx";

export const OnboardingShell = ({ children }: { children: React.ReactNode }) => {
    const { step, back, next, stepsCount, completedSteps } = useOnboarding();

    const completedCount = completedSteps.filter(Boolean).length;
    const progress = (completedCount / stepsCount) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-4xl w-full mx-auto p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={back}
                            className={clsx("px-3 py-2 rounded-md", step === 1 ? "invisible" : "bg-white")}
                            aria-label="Back"
                        >
                            ← Back
                        </button>
                    </div>

                    <div className="text-sm text-gray-600">Step {step} of {stepsCount}</div>

                    <div>
                        <button
                            onClick={next}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                            aria-label="Next"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="h-2 w-full bg-gray-200 rounded">
                        <motion.div
                            className="h-2 bg-indigo-600 rounded"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        {completedCount} / {stepsCount} sections complete
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-lg shadow p-6">{children}</div>
            </div>
        </div>
    );
};
