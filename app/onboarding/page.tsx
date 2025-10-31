// app/onboarding/page.tsx
"use client";

import React, { useState } from "react";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import Step1Basics from "@/components/onboarding/steps/Step1Basics";
import Step2Location from "@/components/onboarding/steps/Step2Location";
import Step3Staff from "@/components/onboarding/steps/Step3Staff";
import Step4Settings from "@/components/onboarding/steps/Step4Settings";
import { useRouter } from "next/navigation";

function OnboardingContent() {
    const { step, data, stepsCount, setCompletedStep } = useOnboarding();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const stepComponents = [
        <Step1Basics key="s1" />,
        <Step2Location key="s2" />,
        <Step3Staff key="s3" />,
        <Step4Settings key="s4" />,
    ];

    const handleFinish = async () => {
        setError(null);
        setSubmitting(true);
        try {
            // final validation occurs server-side in completeOnboardingAction
            const res = await fetch("/api/internal/onboarding/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error ?? "Failed to complete onboarding");
            // success: redirect into app
            router.push("/dashboard");
        } catch (err: any) {
            setError(err?.message ?? "Failed to finish onboarding");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <OnboardingShell>
            <div>
                {stepComponents[step - 1]}

                <div className="flex items-center justify-between mt-6">
                    <div />
                    <div className="flex gap-3">
                        {step < stepsCount ? (
                            <button
                                onClick={() => setCompletedStep(step - 1, true)}
                                className="px-4 py-2 bg-gray-100 rounded"
                            >
                                Save step
                            </button>
                        ) : null}

                        {step < stepsCount ? (
                            <button
                                onClick={() => {
                                    // simply trigger blur validations already wired per step, then next button from shell will move forward
                                    const activeEl = document.activeElement;
                                    if (activeEl instanceof HTMLElement) {
                                        activeEl.blur();
                                    }
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={submitting}
                                className="px-4 py-2 bg-emerald-600 text-white rounded"
                            >
                                {submitting ? "Finishing..." : "Finish onboarding"}
                            </button>
                        )}
                    </div>
                </div>

                {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
            </div>
        </OnboardingShell>
    );
}

export default function OnboardingPageWrapper() {
    return (
        <OnboardingProvider>
            <OnboardingContent />
        </OnboardingProvider>
    );
}
