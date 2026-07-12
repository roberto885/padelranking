import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const applicationStatus = pgEnum("application_status", ["pending", "approved", "rejected", "suspended", "withdrawn"]);
export const clubRole = pgEnum("club_role", ["owner", "administrator", "tournament_director", "player"]);
export const playerKind = pgEnum("player_kind", ["registered", "guest"]);
export const courtEnvironment = pgEnum("court_environment", ["indoor", "outdoor"]);
export const matchStatus = pgEnum("match_status", ["scheduled", "in_progress", "pending_confirmation", "confirmed", "disputed", "void"]);
export const scoreSubmissionStatus = pgEnum("score_submission_status", ["pending", "accepted", "disputed", "superseded"]);
export const eventStatus = pgEnum("event_status", ["draft", "registration_open", "registration_closed", "published", "in_progress", "completed", "cancelled"]);
export const eventFormat = pgEnum("event_format", ["americano", "mexicano", "round_robin", "single_elimination"]);
export const registrationStatus = pgEnum("registration_status", ["pending", "confirmed", "waitlisted", "withdrawn", "rejected"]);

const ids = { id: uuid("id").defaultRandom().primaryKey() };
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  ...ids,
  email: text("email").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  preferredLocale: text("preferred_locale").default("es-MX").notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("users_email_unique").on(t.email)]);

export const authAccounts = pgTable("auth_accounts", {
  ...ids, userId: uuid("user_id").references(() => users.id).notNull(), provider: text("provider").notNull(), providerAccountId: text("provider_account_id").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("auth_provider_account_unique").on(t.provider, t.providerAccountId), uniqueIndex("auth_user_provider_unique").on(t.userId, t.provider)]);

export const magicLinkTokens = pgTable("magic_link_tokens", {
  ...ids, email: text("email").notNull(), requestIpHash: text("request_ip_hash"), tokenHash: text("token_hash").notNull(), expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), usedAt: timestamp("used_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("magic_link_token_hash_unique").on(t.tokenHash), index("magic_link_expiry_idx").on(t.expiresAt)]);

export const sessions = pgTable("sessions", {
  ...ids, userId: uuid("user_id").references(() => users.id).notNull(), tokenHash: text("token_hash").notNull(), expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), revokedAt: timestamp("revoked_at", { withTimezone: true }), lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(), stepUpVerifiedAt: timestamp("step_up_verified_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("session_token_hash_unique").on(t.tokenHash), index("session_user_idx").on(t.userId), index("session_expiry_idx").on(t.expiresAt)]);

export const clubs = pgTable("clubs", {
  ...ids,
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  currency: text("currency").default("MXN").notNull(),
  timezone: text("timezone").default("America/Matamoros").notNull(),
  defaultLocale: text("default_locale").default("es-MX").notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("clubs_slug_unique").on(t.slug)]);

export const clubApplications = pgTable("club_applications", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: applicationStatus("status").default("pending").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewReason: text("review_reason"),
  ...timestamps,
}, (t) => [uniqueIndex("club_application_user_unique").on(t.clubId, t.userId), index("club_application_queue_idx").on(t.clubId, t.status)]);

export const roleAssignments = pgTable("role_assignments", {
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: clubRole("role").notNull(),
  assignedBy: uuid("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.clubId, t.userId, t.role] }), index("role_assignment_actor_idx").on(t.clubId, t.userId)]);

export const playerProfiles = pgTable("player_profiles", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  kind: playerKind("kind").notNull(),
  fullName: text("full_name").notNull(),
  dominantHand: text("dominant_hand"),
  preferredSide: text("preferred_side"),
  selfAssessedLevel: text("self_assessed_level"),
  verifiedLevel: text("verified_level"),
  rating: integer("rating").default(1500).notNull(),
  ratingDeviation: integer("rating_deviation").default(350).notNull(),
  privacy: jsonb("privacy").$type<{ publicName: boolean; publicPhoto: boolean }>().default({ publicName: true, publicPhoto: false }).notNull(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("player_profile_user_per_club_unique").on(t.clubId, t.userId), index("player_profile_club_name_idx").on(t.clubId, t.fullName)]);

export const clubLocations = pgTable("club_locations", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  timezone: text("timezone").notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("club_location_name_unique").on(t.clubId, t.name)]);

export const courts = pgTable("courts", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  locationId: uuid("location_id").references(() => clubLocations.id).notNull(),
  name: text("name").notNull(),
  environment: courtEnvironment("environment").notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("court_name_per_location_unique").on(t.clubId, t.locationId, t.name), index("courts_club_idx").on(t.clubId)]);

export const matches = pgTable("matches", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  status: matchStatus("status").default("scheduled").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  officialSubmissionId: uuid("official_submission_id"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [index("matches_club_status_idx").on(t.clubId, t.status)]);

export const matchParticipants = pgTable("match_participants", {
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  playerProfileId: uuid("player_profile_id").references(() => playerProfiles.id).notNull(),
  team: integer("team").notNull(),
  position: integer("position").notNull(),
}, (t) => [primaryKey({ columns: [t.matchId, t.playerProfileId] }), uniqueIndex("match_team_position_unique").on(t.matchId, t.team, t.position)]);

export const scoreSubmissions = pgTable("score_submissions", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  submittedByPlayerId: uuid("submitted_by_player_id").references(() => playerProfiles.id).notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  sets: jsonb("sets").$type<Array<{ team1: number; team2: number }>>().notNull(),
  winningTeam: integer("winning_team").notNull(),
  status: scoreSubmissionStatus("status").default("pending").notNull(),
  confirmAfter: timestamp("confirm_after", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("score_submission_idempotency_unique").on(t.clubId, t.idempotencyKey), index("score_confirmation_due_idx").on(t.status, t.confirmAfter)]);

export const scoreConfirmations = pgTable("score_confirmations", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  submissionId: uuid("submission_id").references(() => scoreSubmissions.id).notNull(),
  confirmedByPlayerId: uuid("confirmed_by_player_id").references(() => playerProfiles.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("score_confirmation_player_unique").on(t.submissionId, t.confirmedByPlayerId)]);

export const scoreDisputes = pgTable("score_disputes", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  submissionId: uuid("submission_id").references(() => scoreSubmissions.id).notNull(),
  disputedByPlayerId: uuid("disputed_by_player_id").references(() => playerProfiles.id).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("score_dispute_player_unique").on(t.submissionId, t.disputedByPlayerId)]);

export const events = pgTable("events", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), name: text("name").notNull(), slug: text("slug").notNull(), status: eventStatus("status").default("draft").notNull(), startsAt: timestamp("starts_at", { withTimezone: true }).notNull(), endsAt: timestamp("ends_at", { withTimezone: true }).notNull(), public: boolean("public").default(false).notNull(), ...timestamps,
}, (t) => [uniqueIndex("event_slug_per_club_unique").on(t.clubId, t.slug), index("event_club_start_idx").on(t.clubId, t.startsAt)]);

export const eventCategories = pgTable("event_categories", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), eventId: uuid("event_id").references(() => events.id).notNull(), name: text("name").notNull(), format: eventFormat("format").notNull(), capacity: integer("capacity").notNull(), configuration: jsonb("configuration").notNull(), ...timestamps,
}, (t) => [uniqueIndex("event_category_name_unique").on(t.eventId, t.name)]);

export const registrations = pgTable("registrations", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), categoryId: uuid("category_id").references(() => eventCategories.id).notNull(), playerProfileId: uuid("player_profile_id").references(() => playerProfiles.id).notNull(), partnerPlayerId: uuid("partner_player_id").references(() => playerProfiles.id), status: registrationStatus("status").default("pending").notNull(), waitlistPosition: integer("waitlist_position"), ...timestamps,
}, (t) => [uniqueIndex("registration_player_category_unique").on(t.categoryId, t.playerProfileId), index("registration_queue_idx").on(t.categoryId, t.status, t.createdAt)]);

export const eventEntries = pgTable("event_entries", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), categoryId: uuid("category_id").references(() => eventCategories.id).notNull(), seed: integer("seed"), label: text("label").notNull(), playerIds: jsonb("player_ids").$type<string[]>().notNull(), ...timestamps,
}, (t) => [uniqueIndex("event_entry_seed_unique").on(t.categoryId, t.seed)]);

export const scheduleVersions = pgTable("schedule_versions", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), categoryId: uuid("category_id").references(() => eventCategories.id).notNull(), version: integer("version").notNull(), status: text("status").default("draft").notNull(), generatedBy: uuid("generated_by").references(() => users.id), publishedAt: timestamp("published_at", { withTimezone: true }), configuration: jsonb("configuration").notNull(), ...timestamps,
}, (t) => [uniqueIndex("schedule_category_version_unique").on(t.categoryId, t.version)]);

export const scheduleSlots = pgTable("schedule_slots", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), scheduleVersionId: uuid("schedule_version_id").references(() => scheduleVersions.id).notNull(), matchId: uuid("match_id").references(() => matches.id).notNull(), courtId: uuid("court_id").references(() => courts.id).notNull(), startsAt: timestamp("starts_at", { withTimezone: true }).notNull(), endsAt: timestamp("ends_at", { withTimezone: true }).notNull(), locked: boolean("locked").default(false).notNull(), ...timestamps,
}, (t) => [uniqueIndex("schedule_match_version_unique").on(t.scheduleVersionId, t.matchId), index("schedule_court_time_idx").on(t.clubId, t.courtId, t.startsAt)]);

export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id").references(() => users.id).primaryKey(), inApp: boolean("in_app").default(true).notNull(), email: boolean("email").default(true).notNull(), push: boolean("push").default(false).notNull(), quietStartHour: integer("quiet_start_hour"), quietEndHour: integer("quiet_end_hour"), timezone: text("timezone").default("America/Matamoros").notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notificationOutbox = pgTable("notification_outbox", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), userId: uuid("user_id").references(() => users.id).notNull(), type: text("type").notNull(), channel: text("channel").notNull(), deduplicationKey: text("deduplication_key").notNull(), payload: jsonb("payload").notNull(), deliverAfter: timestamp("deliver_after", { withTimezone: true }).notNull(), deliveredAt: timestamp("delivered_at", { withTimezone: true }), attempts: integer("attempts").default(0).notNull(), lastError: text("last_error"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("notification_deduplication_unique").on(t.deduplicationKey), index("notification_delivery_queue_idx").on(t.deliveredAt, t.deliverAfter)]);

export const ratingFormulaVersions = pgTable("rating_formula_versions", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  version: text("version").notNull(),
  configuration: jsonb("configuration").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("rating_formula_version_unique").on(t.clubId, t.version)]);

export const clubLevelBands = pgTable("club_level_bands", {
  ...ids, clubId: uuid("club_id").references(() => clubs.id).notNull(), code: text("code").notNull(), labelEs: text("label_es").notNull(), labelEn: text("label_en").notNull(), displayOrder: integer("display_order").notNull(), initialRating: integer("initial_rating").notNull(), active: boolean("active").default(true).notNull(), ...timestamps,
}, (t) => [uniqueIndex("club_level_code_unique").on(t.clubId, t.code), uniqueIndex("club_level_order_unique").on(t.clubId, t.displayOrder)]);

export const ratingTransactions = pgTable("rating_transactions", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  playerProfileId: uuid("player_profile_id").references(() => playerProfiles.id).notNull(),
  formulaVersionId: uuid("formula_version_id").references(() => ratingFormulaVersions.id).notNull(),
  ratingBefore: integer("rating_before").notNull(),
  ratingAfter: integer("rating_after").notNull(),
  deviationBefore: integer("deviation_before").notNull(),
  deviationAfter: integer("deviation_after").notNull(),
  expectedProbabilityBps: integer("expected_probability_bps").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("rating_transaction_match_player_unique").on(t.matchId, t.playerProfileId), index("rating_history_player_idx").on(t.clubId, t.playerProfileId, t.createdAt)]);

export const auditLogs = pgTable("audit_logs", {
  ...ids,
  clubId: uuid("club_id").references(() => clubs.id).notNull(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id"),
  reason: text("reason"),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("audit_log_club_time_idx").on(t.clubId, t.createdAt)]);
