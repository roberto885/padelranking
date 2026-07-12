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

## Demonstration-only boundaries

The current screens use typed sample data and client-side state. They demonstrate and validate UX, but do not yet persist real operations. Specifically:

- Google OAuth is not implemented. Magic-link email requires provisioned PostgreSQL, a verified sender domain, and provider credentials.
- Event, registration, score, court-control, matchmaking, and confirmation screens do not call protected server routes.
- Public event, TV, bracket, ranking, and rating-history pages are not querying PostgreSQL or receiving live updates.
- The 24-hour confirmation and notification outbox workers are designed but not running.
- Database migrations are generated but have not been applied to a local, staging, or production database in this workspace.
- Offline writes, QR workflows, push subscriptions, uploads, exports, and account deletion are not implemented.

No current UI action should be presented to club staff as production data entry.

## Verification status

- 129 unit tests pass locally.
- 10 PostgreSQL integration tests are conditionally skipped because no local PostgreSQL runtime is installed.
- ESLint and TypeScript pass.
- The optimized Next.js production build passes.
- GitHub Actions is configured to start PostgreSQL 17, apply migrations, run integration/unit tests, lint, type-check, and build once a remote repository is configured and pushed.
- Accessibility, browser end-to-end, security scan, load, backup/restore, and real-email tests remain pending.

## Next critical milestone: deploy and verify the connected pilot slice

Complete one real workflow end to end before expanding feature breadth:

1. Provision staging PostgreSQL and a verified transactional-email sender.
2. Apply migrations, run the staging seed, and execute all conditional integration tests.
3. Configure the club ID and validate magic-link → application → administrator approval → current-user context with synthetic accounts.
4. Add browser end-to-end coverage for that connected path.
5. Add Google OAuth (administrator TOTP 2FA/step-up is implemented; verify it against staging PostgreSQL).
6. Run privacy, accessibility, and threat-model reviews for the connected slice.
7. Pilot with staff-only synthetic accounts before any real player data.

After this connected slice is reliable, connect events, registrations, matches/results/ratings, scheduling, live public projections, and notifications in that order.

## External decisions and access still required

- Exact club physical address/IANA timezone.
- Approved hosting and database region/provider.
- Production domain and email sender domain.
- Google OAuth project credentials.
- Email provider credentials.
- Authentication secret and managed secret storage.
- Approved privacy notice, consent text, retention policy, and data-processors/transfers review for Mexico.
- Final level bands, rating seed map, scoring formats, tie-break policies, and public-profile fields.
- Remote GitHub repository and hosting project, if the owner wants this repository published and deployed.
