import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index"; // your drizzle instance
import * as schema from "@/app/lib/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema
    }),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            hasOnboarded: {
                type: 'boolean',
                required: true,
                defaultValue: false,
                input: false
            }
        }
    }
});