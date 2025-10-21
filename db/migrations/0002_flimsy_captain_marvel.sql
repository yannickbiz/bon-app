CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"ingredients" jsonb NOT NULL,
	"instructions" jsonb NOT NULL,
	"scraped_content_id" integer NOT NULL,
	"original_data" jsonb NOT NULL,
	"confidence" numeric(5, 4),
	"ai_provider" text,
	"transcription" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_scraped_content_id_unique" UNIQUE("scraped_content_id")
);
--> statement-breakpoint
CREATE TABLE "user_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"custom_title" text,
	"custom_ingredients" jsonb,
	"custom_instructions" jsonb,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_scraped_content_id_scraped_content_id_fk" FOREIGN KEY ("scraped_content_id") REFERENCES "public"."scraped_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_recipe_idx" ON "user_recipes" USING btree ("user_id","recipe_id");