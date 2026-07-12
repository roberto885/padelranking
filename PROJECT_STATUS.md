# Project status

**Updated:** July 11, 2026  
**Current stage:** Connected authentication/application pilot slice plus broader interactive MVP prototype  
**Production status:** Not deployable for real club operations yet

## What is implemented

### Product and architecture

- Product discovery, approved owner assumptions, MVP PRD, page map, ER model, roadmap, API contract, security/privacy plan, test/deployment plan, launch checklist, and architecture decisions.
- Modular Next.js/TypeScript application with PostgreSQL/Drizzle migrations.
- Club-scoped identity, application, roles, players/guests, courts, matches, results, ratings, events, registration, scheduling, notifications, and authentication schema.

### Tested domain behavior

- Club-scoped permissions and open-application review.
- Guest-profile claim without losing competition history.
- Court operating-window validation.
- Padel score validation, idempotent submission, opponent confirmation/dispute, and the 24-hour policy.
- Transaction boundary for confirmation, four rating updates, immutable history, and audit logging.
- Doubles-aware Glicko-2, confidence, formula snapshots, and verified-level seeding.
- Two-way and circular tie-breaks with deterministic fallback and explanations.
- Americano, Mexicano, round robin, and single-elimination generation.
- Court scheduling with availability, rest, blackouts, locks, and conflict explanations.
- Registration, eligibility, partners, waiting lists, withdrawal, and promotion.
- Event publication-readiness gate.
- Notification preferences, quiet hours, deduplicated outbox, and delivery claiming.
- Hashed single-use magic links, revocable sessions, request rate policy, and redirect allow-listing.
- RFC 6238 TOTP with encrypted-at-rest secrets, replay protection, and the administrator step-up freshness policy.
- Privacy-aware partner and balanced-foursome recommendations.
- Environment validation and dependency health status.

### Interactive experience

- Player home dashboard.
- Passwordless/Google sign-in presentation.
- Open club application and administrator review queue.
- Public live event, elimination bracket, rankings, and TV mode.
- Event registration, score submission, opponent confirmation/dispute, and rating history.
- Organizer event wizard and live court control.
- Partner/open-match discovery.
- Installable PWA manifest, service worker, cached public event shell, and offline fallback.
- Navigable route map at `/demo`.

### Production-connected pilot path

- Rate-limited magic-link requests send through the Resend HTTPS adapter when credentials are configured.
- Magic-link consumption atomically verifies/creates the user, consumes the one-use token, stores a hashed session, and sets a secure HTTP-only cookie.
- Session resolution, current-user context, logout, and server-side revocation are connected to PostgreSQL.
- Player applications submit through a same-origin, authenticated, validated API and atomically create the application/profile.
- Owner/administrator application queues are club-scoped and permission checked.
- Approval/rejection decisions lock the application, seed the verified-level rating, and write the audit event in one transaction.
- Configured application and review UIs use these APIs; unconfigured local demos use isolated sample state.
- An idempotent staging seed creates the initial owner, club, location, level bands, and courts.
- Administrator application decisions require an activated TOTP authenticator and a fresh (30-minute) step-up verification; enrollment, activation, and step-up endpoints are connected, and the review queue walks staff through both flows inline.
- Google sign-in uses the authorization-code flow with PKCE, sealed state/nonce cookies, verified-email account linking, and PostgreSQL sessions; the sign-in button activates only when Google credentials are configured.

## Demonstration-only boundaries

The current screens use typed sample data and client-side state. They demonstrate and validate UX, but do not yet persist real operations. Specifically:

- Google OAuth is implemented but has never run against real Google credentials; it stays disabled until a Google Cloud project, client ID/secret, and the registered redirect URI exist. Magic-link email requires provisioned PostgreSQL, a verified sender domain, and provider credentials.
- Event, registration, score, court-control, matchmaking, and confirmation screens do not call protected server routes.
- Public event, TV, bracket, ranking, and rating-history pages are not querying PostgreSQL or receiving live updates.
- The 24-hour confirmation and notification outbox workers are designed but not running.
- The application itself is not yet deployed; the staging database exists (Neon) but no hosted app points at it until Vercel is configured.
- Offline writes, QR workflows, push subscriptions, uploads, exports, and account deletion are not implemented.

No current UI action should be presented to club staff as production data entry.

## Verification status

- 135 unit tests pass locally.
- 12 PostgreSQL integration tests are conditionally skipped locally (no PostgreSQL runtime on this machine) but run green in CI.
- GitHub Actions CI is live at github.com/roberto885/padelranking and passing: PostgreSQL 17 service, all 10 migrations applied, 147 tests, lint, type-check, and production build (first green run July 11, 2026).
- ESLint and TypeScript pass.
- The optimized Next.js production build passes.
- Accessibility, browser end-to-end, security scan, load, backup/restore, and real-email tests remain pending.

## Next critical milestone: deploy and verify the connected pilot slice

Complete one real workflow end to end before expanding feature breadth:

1. Provision staging PostgreSQL and a verified transactional-email sender.
2. Apply migrations, run the staging seed, and execute all conditional integration tests.
3. Configure the club ID and validate magic-link → application → administrator approval → current-user context with synthetic accounts.
4. Add browser end-to-end coverage for that connected path.
5. Verify administrator TOTP 2FA/step-up and Google OAuth against staging PostgreSQL and real Google credentials (both are implemented and config-gated).
6. Run privacy, accessibility, and threat-model reviews for the connected slice.
7. Pilot with staff-only synthetic accounts before any real player data.

After this connected slice is reliable, connect events, registrations, matches/results/ratings, scheduling, live public projections, and notifications in that order.

## Owner decisions (locked July 11, 2026)

- Hosting/database: Vercel + Neon PostgreSQL 17 in AWS us-east-1; pilot on the free `*.vercel.app` subdomain (custom domain deferred).
- Email: Resend, in test mode (owner-only delivery) until a domain is verified.
- Repository: private GitHub repository with the existing CI.
- Timezone: `America/Matamoros` confirmed (club street address still pending — needed for the privacy notice).
- Level bands: Principiante 1100 / Intermedio 1500 / Avanzado 1900 confirmed as seeded.
- Public-profile default: name public, photo private, confirmed as implemented.
- Privacy documents: drafts in `docs/legal/` pending owner/legal review before any real player data.
- The full setup sequence is in `docs/PROVISIONING.md`.

## External access still required

- ~~GitHub~~ done: private repository `roberto885/padelranking` with a fine-grained PAT in the macOS keychain; CI green.
- ~~Neon~~ done: staging PostgreSQL 17 live in us-east-1; migrations applied, 147/147 tests pass against it, club `Rincón del Bosque` seeded (July 11, 2026).
- Owner sign-ups still pending: Vercel and Resend accounts, then the environment variables listed in the runbook (including a fresh `AUTH_SECRET` stored only in Vercel).
- Club street address for the privacy notice, and the club's legal/display name for the seed.
- Later: custom domain purchase, Resend domain verification, Google OAuth client, and signed DPAs with the three processors.
