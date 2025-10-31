CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cafe_id" integer NOT NULL,
	"name" varchar(300) NOT NULL,
	"slug" varchar(320) NOT NULL,
	"description" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(10) DEFAULT 'EUR' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"category" varchar(120),
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "menu_items_cafe_slug_idx" ON "menu_items" USING btree ("cafe_id","slug");