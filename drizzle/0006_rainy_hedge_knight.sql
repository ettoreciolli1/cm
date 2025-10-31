CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_id" integer NOT NULL,
	"name" varchar(300) NOT NULL,
	"contact" varchar(300),
	"website" text,
	"unit_price_cents" integer DEFAULT 0 NOT NULL,
	"unit" varchar(50),
	"lead_time_days" integer,
	"preferred" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "suppliers_ingredient_idx" ON "suppliers" USING btree ("ingredient_id");