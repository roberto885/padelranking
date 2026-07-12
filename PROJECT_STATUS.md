# Project status

**Updated:** July 11, 2026  
**Current stage:** MVP architecture and interactive vertical-slice prototype  
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

## Demonstration-only boundaries

The current screens use typed sample data and client-side state. They demonstrate and validate UX, but do not yet persist real operations. Specifically:

- Sign-in does not send email or complete Google OAuth.
- Application, event, registration, score, court-control, matchmaking, and confirmation screens do not call protected server routes.
- Public event, TV, bracket, ranking, and rating-history pages are not querying PostgreSQL or receiving live updates.
- The 24-hour confirmation and notification outbox workers are designed but not running.
- Database migrations are generated but have not been applied to a local, staging, or production database in this workspace.
- Offline writes, QR workflows, push subscriptions, uploads, exports, and account deletion are not implemented.

No current UI action should be presented to club staff as production data entry.

## Verification status

- 110 unit tests pass locally.
- 3 PostgreSQL integration tests are conditionally skipped because no local PostgreSQL runtime is installed.
- ESLint and TypeScript pass.
- The optimized Next.js production build passes.
- GitHub Actions is configured to start PostgreSQL 17, apply migrations, run integration/unit tests, lint, type-check, and build once a remote repository is configured and pushed.
- Accessibility, browser end-to-end, security scan, load, backup/restore, and real-email tests remain pending.

## Next critical milestone: connected pilot slice

Complete one real workflow end to end before expanding feature breadth:

1. Provision staging PostgreSQL and transactional email.
2. Apply migrations and complete integration-test fixtures.
3. Implement session-cookie and CSRF adapters around the authentication core.
4. Send/consume real magic links; connect Google OAuth; require administrator step-up/2FA.
5. Implement protected server routes for club applications and player profiles.
6. Replace the application and review-queue sample data with PostgreSQL repositories.
7. Add route, permission, and browser tests for open application → administrator approval → verified-level seed.
8. Run privacy, accessibility, and threat-model reviews for this slice.
9. Pilot with staff-only synthetic accounts before any real player data.

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
