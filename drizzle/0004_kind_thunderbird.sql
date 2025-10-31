CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_item_id" integer NOT NULL,
	"name" varchar(300) NOT NULL,
	"quantity" varchar(100),
	"unit" varchar(50),
	"cost_cents" integer DEFAULT 0 NOT NULL,
	"allergen" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ingredients_menu_item_idx" ON "ingredients" USING btree ("menu_item_id");