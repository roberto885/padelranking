CREATE TABLE "user_totp_credentials" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"secret_box" text NOT NULL,
	"activated_at" timestamp with time zone,
	"last_used_step" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_totp_credentials" ADD CONSTRAINT "user_totp_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;