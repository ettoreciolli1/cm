CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(200),
	"role" varchar(50),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
