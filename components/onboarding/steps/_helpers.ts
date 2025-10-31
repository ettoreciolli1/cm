// components/onboarding/steps/_helpers.ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function useZodForm<T extends object>(schema: any, opts = {}) {
    return useForm<T>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        ...opts,
    });
}
