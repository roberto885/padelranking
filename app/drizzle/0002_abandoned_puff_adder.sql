CREATE TABLE "rating_formula_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"version" text NOT NULL,
	"configuration" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rating_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"player_profile_id" uuid NOT NULL,
	"formula_version_id" uuid NOT NULL,
	"rating_before" integer NOT NULL,
	"rating_after" integer NOT NULL,
	"deviation_before" integer NOT NULL,
	"deviation_after" integer NOT NULL,
	"expected_probability_bps" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"explanation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rating_formula_versions" ADD CONSTRAINT "rating_formula_versions_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_transactions" ADD CONSTRAINT "rating_transactions_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_transactions" ADD CONSTRAINT "rating_transactions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_transactions" ADD CONSTRAINT "rating_transactions_player_profile_id_player_profiles_id_fk" FOREIGN KEY ("player_profile_id") REFERENCES "public"."player_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_transactions" ADD CONSTRAINT "rating_transactions_formula_version_id_rating_formula_versions_id_fk" FOREIGN KEY ("formula_version_id") REFERENCES "public"."rating_formula_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rating_formula_version_unique" ON "rating_formula_versions" USING btree ("club_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "rating_transaction_match_player_unique" ON "rating_transactions" USING btree ("match_id","player_profile_id");--> statement-breakpoint
CREATE INDEX "rating_history_player_idx" ON "rating_transactions" USING btree ("club_id","player_profile_id","created_at");