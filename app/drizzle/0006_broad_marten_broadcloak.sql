CREATE TABLE "club_level_bands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"code" text NOT NULL,
	"label_es" text NOT NULL,
	"label_en" text NOT NULL,
	"display_order" integer NOT NULL,
	"initial_rating" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_level_bands" ADD CONSTRAINT "club_level_bands_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "club_level_code_unique" ON "club_level_bands" USING btree ("club_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "club_level_order_unique" ON "club_level_bands" USING btree ("club_id","display_order");