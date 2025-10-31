import { pgTable, text, timestamp, boolean, serial, varchar, index, numeric, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    hasOnboarded: boolean("has_onboarded").default(false).notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const cafes = pgTable(
    "cafes",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 300 }).notNull(),
        slug: varchar("slug", { length: 320 }).notNull(),
        owner_id: text("owner_id").notNull().unique(), // references user.id logically
        address: text("address"),
        city: varchar("city", { length: 200 }),
        country: varchar("country", { length: 100 }),
        phone: varchar("phone", { length: 50 }),
        timezone: varchar("timezone", { length: 100 }),
        opening_hours: text("opening_hours"), // JSON / human readable
        pos_enabled: boolean("pos_enabled").notNull().default(true),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => {
        return {
            owner_unique: index("cafes_owner_unique").on(table.owner_id),
            slug_idx: index("cafes_slug_idx").on(table.slug),
        };
    }
);

export const menu_items = pgTable(
    "menu_items",
    {
        id: serial("id").primaryKey(),
        cafe_id: integer("cafe_id").notNull(), // integer to match cafes.id serial
        name: varchar("name", { length: 300 }).notNull(),
        slug: varchar("slug", { length: 320 }).notNull(),
        description: text("description"),
        // store price as integer cents — avoids numeric/string typing issues
        price_cents: integer("price_cents").notNull().default(0),
        currency: varchar("currency", { length: 10 }).notNull().default("EUR"),
        available: boolean("available").notNull().default(true),
        category: varchar("category", { length: 120 }),
        image_url: text("image_url"),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => {
        return {
            cafe_slug_idx: index("menu_items_cafe_slug_idx").on(table.cafe_id, table.slug),
        };
    }
);

export const ingredients = pgTable(
    "ingredients",
    {
        id: serial("id").primaryKey(),
        menu_item_id: integer("menu_item_id").notNull(), // references menu_items.id logically
        menu_item_slug: varchar("slug", { length: 320 }).notNull(),
        name: varchar("name", { length: 300 }).notNull(),
        quantity: varchar("quantity", { length: 100 }), // e.g. "200g", "1 cup"
        unit: varchar("unit", { length: 50 }), // optional normalized unit
        cost_cents: integer("cost_cents").notNull().default(0), // cost per ingredient (optional)
        allergen: boolean("allergen").notNull().default(false),
        notes: text("notes"),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
    },
    (t) => {
        return {
            item_idx: index("ingredients_menu_item_idx").on(t.menu_item_id),
        };
    }
);

export const suppliers = pgTable(
    "suppliers",
    {
        id: serial("id").primaryKey(),
        slug: varchar("slug", { length: 320 }).notNull(),
        ingredient_id: integer("ingredient_id").notNull(), // references ingredients.id
        name: varchar("name", { length: 300 }).notNull(),
        contact: varchar("contact", { length: 300 }), // phone/email or contact name
        website: text("website"),
        unit_price_cents: integer("unit_price_cents").notNull().default(0), // price per unit
        unit: varchar("unit", { length: 50 }), // e.g. "kg", "each"
        lead_time_days: integer("lead_time_days"),
        preferred: boolean("preferred").notNull().default(false),
        notes: text("notes"),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
    },
    (t) => {
        return {
            ingredient_idx: index("suppliers_ingredient_idx").on(t.ingredient_id),
        };
    }
);

export const employees = pgTable("employees", {
    id: serial("id").primaryKey(),
    first_name: varchar("first_name", { length: 100 }),
    last_name: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 200 }),
    role: varchar("role", { length: 50 }),
    active: boolean("active").default(true),
    created_at: timestamp("created_at").defaultNow(),
});
