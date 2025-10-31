export type Cafe = {
    id: number;
    name: string;
    slug: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    timezone?: string | null;
};

export type MenuItem = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    price?: number; // decimal
    currency?: string | null;
    available?: boolean;
    category?: string | null;
    image_url?: string | null;
};

export type Ingredient = {
    id: number;
    menu_item_id: number;
    menu_item_slug?: string;
    menu_item_name?: string; // <-- add this
    name: string;
    quantity?: string;
    unit?: string;
    cost?: number;
    allergen?: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
};


export interface Supplier {
    id: number;
    ingredient_id: number;             // FK → ingredients.id
    name: string;                      // supplier name
    contact?: string | null;           // phone/email/etc
    website?: string | null;           // supplier website
    unit_price?: number | null;        // price per unit (in dollars, not cents)
    unit?: string | null;              // e.g. "kg", "L", "box"
    lead_time_days?: number | null;    // days to deliver
    preferred?: boolean;               // marked as preferred supplier
    notes?: string | null;             // freeform notes
    created_at?: string;               // ISO timestamp
    updated_at?: string;               // ISO timestamp
}

// app/lib/types.ts
export type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    active: boolean;
    created_at: string; // ISO timestamp string
};
