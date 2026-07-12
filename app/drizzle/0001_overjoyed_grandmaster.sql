CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'in_progress', 'pending_confirmation', 'confirmed', 'disputed', 'void');--> statement-breakpoint
CREATE TYPE "public"."score_submission_status" AS ENUM('pending', 'accepted', 'disputed', 'superseded');--> statement-breakpoint
CREATE TABLE "match_participants" (
	"match_id" uuid NOT NULL,
	"player_profile_id" uuid NOT NULL,
	"team" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "match_participants_match_id_player_profile_id_pk" PRIMARY KEY("match_id","player_profile_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"official_submission_id" uuid,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_confirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"confirmed_by_player_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"disputed_by_player_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"submitted_by_player_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"sets" jsonb NOT NULL,
	"winning_team" integer NOT NULL,
	"status" "score_submission_status" DEFAULT 'pending' NOT NULL,
	"confirm_after" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_player_profile_id_player_profiles_id_fk" FOREIGN KEY ("player_profile_id") REFERENCES "public"."player_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_confirmations" ADD CONSTRAINT "score_confirmations_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_confirmations" ADD CONSTRAINT "score_confirmations_submission_id_score_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."score_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_confirmations" ADD CONSTRAINT "score_confirmations_confirmed_by_player_id_player_profiles_id_fk" FOREIGN KEY ("confirmed_by_player_id") REFERENCES "public"."player_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_disputes" ADD CONSTRAINT "score_disputes_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_disputes" ADD CONSTRAINT "score_disputes_submission_id_score_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."score_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_disputes" ADD CONSTRAINT "score_disputes_disputed_by_player_id_player_profiles_id_fk" FOREIGN KEY ("disputed_by_player_id") REFERENCES "public"."player_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_submissions" ADD CONSTRAINT "score_submissions_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_submissions" ADD CONSTRAINT "score_submissions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_submissions" ADD CONSTRAINT "score_submissions_submitted_by_player_id_player_profiles_id_fk" FOREIGN KEY ("submitted_by_player_id") REFERENCES "public"."player_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "match_team_position_unique" ON "match_participants" USING btree ("match_id","team","position");--> statement-breakpoint
CREATE INDEX "matches_club_status_idx" ON "matches" USING btree ("club_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "score_confirmation_player_unique" ON "score_confirmations" USING btree ("submission_id","confirmed_by_player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "score_dispute_player_unique" ON "score_disputes" USING btree ("submission_id","disputed_by_player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "score_submission_idempotency_unique" ON "score_submissions" USING btree ("club_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "score_confirmation_due_idx" ON "score_submissions" USING btree ("status","confirm_after");