CREATE TABLE "cafes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(300) NOT NULL,
	"slug" varchar(320) NOT NULL,
	"owner_id" text NOT NULL,
	"address" text,
	"city" varchar(200),
	"country" varchar(100),
	"phone" varchar(50),
	"timezone" varchar(100),
	"opening_hours" text,
	"pos_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cafes_owner_id_unique" UNIQUE("owner_id")
);
--> statement-breakpoint
CREATE INDEX "cafes_owner_unique" ON "cafes" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "cafes_slug_idx" ON "cafes" USING btree ("slug");