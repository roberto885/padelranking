# Product Requirements Document

## Club Padel Platform — MVP

**Status:** Working baseline  
**Market:** Private padel club in Mexico  
**Currency:** MXN  
**Primary timezone:** `America/Matamoros` (confirm against the club's physical address before production)  
**Languages:** Spanish and English

## 1. Problem

Club staff need one reliable system to manage player identities and levels, event registration, courts, draws, schedules, verified results, ratings, and public tournament information. Players need a fast phone-first experience that clearly shows what they need to do next. Existing manual workflows create duplicate profiles, scheduling conflicts, delayed results, unclear rankings, and excess administrative work.

## 2. Product objective

Deliver an installable, mobile-first web application that lets one club run common padel competition workflows end to end while preserving trustworthy results and transparent player ratings. The data model and authorization boundaries must support additional clubs later, without building a multi-club operations product in the MVP.

## 3. Launch goals

- At least 80% of active players claim a profile within 90 days.
- A staff member creates a basic social event in under five minutes.
- A player reaches their next match within two primary actions.
- A player submits a valid score in under one minute.
- At least 98% of official results require no later administrative correction.
- At least 95% of published events show current schedules and results publicly.

## 4. Personas and roles

### Club owner

Configures the club, policies, staff permissions, courts, branding, and rating rules; reviews participation and audit history.

### Club administrator

Reviews open applications, manages player and guest profiles, verifies levels, creates events, operates courts, resolves disputes, and corrects results.

### Tournament director

Operates assigned events, registrations, draws, schedules, court assignments, and scores. Access is restricted to assigned events unless separately granted.

### Player

Applies openly, maintains a private club profile, registers for eligible events, views upcoming matches, submits or verifies results, and reviews ratings and rankings.

### Guest player

Has a staff-created competition identity without login and may later claim it. Claiming must preserve the original profile ID and all history.

### Spectator

Views privacy-safe public event schedules, results, standings, brackets, and rankings without signing in.

## 5. MVP scope

### Accounts and club membership

- Open account application.
- Email magic-link and Google authentication.
- Club approval states: applicant, approved, suspended, rejected, and withdrawn.
- Owner, administrator, tournament director, and player authorization.
- Server-side club and role checks for every protected operation.
- Administrator session revocation and two-factor authentication before production launch.
- No junior/guardian accounts in MVP.

### Profiles, guests, and levels

- Player name, photo, language, playing side, dominant hand, self-assessed level, verified club level, availability, rating, and privacy settings.
- Administrator-created guest profiles and signed guest-claim flow.
- Administrator duplicate-profile merge with preview and audit trail.
- Initial ratings seeded from verified level bands using a configurable mapping.
- Seeded players retain high rating uncertainty until enough official matches are played.

### Club and courts

- Club branding, address, MXN currency, terminology, default language, and timezone.
- One visible location at launch; location-aware data model.
- Courts, type, indoor/outdoor status, operating hours, maintenance, and blackouts.

### Matches and results

- Standard doubles.
- Friendly, ranked, league-ready, and tournament match classification; league workflows remain deferred.
- Configured set formats, golden point or advantage, walkover, retirement, incomplete, and administrative result states.
- Set-by-set score validation on server and client.
- Result lifecycle: draft → submitted/pending → confirmed, disputed, void, or superseded.
- An opposing team verification makes a submitted result official immediately.
- An undisputed submission becomes official after 24 hours.
- Authorized staff may confirm, void, or correct a result with a required reason.
- Append-only score submissions, confirmations, disputes, corrections, and audit events.
- Duplicate-safe requests and atomic official-result/rating/ranking updates.

### Rating and ranking

- Doubles-aware Glicko-2 ability rating.
- Separate achievement-points rankings and event standings.
- Provisional status, rating deviation/confidence, eligible-match policy, repeat-opponent dampening, and formula versions.
- Per-match before/after rating, expected win probability, change, and plain-language explanation.
- Immutable calculation snapshots and deterministic recalculation preview.
- Initial verified-level mapping configured by owner before seed data is finalized.

### Events and registration

- Multi-category events.
- Individual or partner registration as allowed by format.
- Capacity, eligibility, waiting list, withdrawal, and staff approval.
- Overlap checks across categories.
- No payment collection in MVP; registration has no paid state requirement.
- Formats: individual Americano, Mexicano, fixed-team round robin, and single elimination.
- Deterministic generators with stored generation seed and version.

### Scheduling and live operations

- Generate schedules using courts, availability, duration, rest, conflicts, and blackouts.
- Explain hard-constraint failures and warnings.
- Preview before publication.
- Lock individual matches; regeneration cannot change completed or locked matches.
- Manual court/time adjustment with immediate conflict feedback.
- Check-in and live court status.

### Public experience and notifications

- Public club event listing and privacy-safe ranking.
- Event overview, schedule, current matches, results, standings, and bracket.
- TV mode with automatic refresh.
- In-app and email notifications for application approval, registration, schedule publication/change, court call/change, score verification, dispute, and rating update.
- Installable PWA and cached essential event information.
- Offline score writes deferred; the UI must not imply a score was submitted when offline.

### Administration

- Player applications, verified levels, guests, courts, events, scores, disputes, and audit log.
- Basic player/event participation reports and CSV export.
- All sensitive actions record actor, club, target, timestamp, reason where relevant, and before/after references.

## 6. Critical workflows and acceptance criteria

### Open application

1. Visitor authenticates by email link or Google.
2. Visitor completes a player application and accepts privacy terms.
3. Administrator reviews and approves the application and verified level.
4. Approved player can register for eligible events.

Acceptance: creating an account alone does not grant membership, event eligibility, or staff access.

### Submit and confirm a result

1. Eligible participant opens the next/current match.
2. Player enters outcome and set scores; invalid score combinations are explained inline.
3. Submission receives an idempotency key and enters pending state.
4. An opponent verifies, disputes, or takes no action.
5. Opponent verification confirms immediately; otherwise a background task confirms after 24 hours only if the result remains undisputed.
6. Confirmation transaction records the official result, rating changes, ranking transactions, notifications, and audit data atomically.

Acceptance: concurrent verification and deadline processing can produce only one official transition and one set of rating effects.

### Run a round-robin event

1. Administrator creates an event/category, registration policy, courts, and time window.
2. Players register; staff resolves waiting list and eligibility.
3. Administrator generates teams/groups/matches and previews warnings.
4. Scheduler assigns courts/times and explains conflicts.
5. Administrator publishes.
6. Players check in and submit results; public standings update from confirmed results.

Acceptance: replaying generation with identical inputs and seed produces identical matches and schedule.

## 7. Business rules requiring configuration

- Verified-level labels and their initial rating mapping.
- Match types eligible for rating and their formula weights.
- Launch scoring formats.
- Tie-break order per format/category.
- Minimum rest and match-duration defaults.
- Registration approval and eligibility rules.
- Public profile fields and photo consent.
- Club physical address and final IANA timezone.
- Retention periods for applications, audit history, uploads, and deleted accounts.

## 8. Non-functional requirements

### Security and privacy

- Tenant-scoped authorization on the server; client checks are presentational only.
- Secure, HTTP-only, same-site cookies; CSRF protection appropriate to the chosen framework.
- Strong schema validation, output encoding, upload controls, rate limiting, and least privilege.
- Administrator 2FA, sensitive-action audit logging, session revocation, account export/deletion, and consent tracking.
- Public DTOs explicitly allow-list fields; private profile data never passes through public loaders.
- Conduct a Mexico privacy-law review before production; implementation defaults do not substitute for legal advice.

### Reliability and data integrity

- PostgreSQL transactions for result confirmation and all derived ledgers.
- Idempotent commands and background jobs.
- Deterministic rating, standing, pairing, and scheduling calculations.
- Automated backups with a tested restore procedure and documented recovery objectives.

### Performance

- Phone-first application shell remains responsive on typical mobile connections.
- Public live pages support tournament traffic without authentication bottlenecks.
- Real-time updates degrade to safe polling without losing correctness.

### Accessibility and localization

- Target WCAG 2.2 AA on critical workflows.
- Keyboard operation, visible focus, accessible names/errors, sufficient contrast, reduced motion, and large touch targets.
- No hard-coded UI strings; locale-aware dates, currency, and pluralization.
- Persist UTC instants and IANA timezone identifiers.

## 9. Out of scope for MVP

- Payments, refunds, taxes, and settlements.
- Junior and guardian accounts.
- Team competitions, leagues, ladders, and challenges.
- SMS/WhatsApp, weather automation, sponsor inventory, loyalty, and wearable/native apps.
- AI recommendations and automated fraud judgments.
- Offline score mutation and QR camera workflows.
- Advanced analytics and PDF exports.

## 10. Delivery sequence

1. Foundation: repository, environments, data model, authentication, authorization, club, profiles, guests, courts, and localization.
2. Trusted matches: result state machine, confirmation/dispute, audit history, rating formula v1, and rankings.
3. First event: registration, fixed-team round robin, basic scheduler, public results, and notifications.
4. Format expansion: Americano, Mexicano, single elimination, court control, TV mode, and PWA caching.
5. Hardening: privacy review, accessibility, load/security tests, backup restoration, pilot event, and staged launch.

## 11. Phase 1 architecture decisions to document before coding

- Unified Next.js modular application versus separate backend.
- ORM and migration strategy.
- Authentication implementation and administrator 2FA.
- Club tenancy enforcement.
- Background job and real-time delivery approach.
- Hosting region, storage, backup, and recovery requirements.

The preferred starting hypothesis is a modular TypeScript monolith because it is the smallest operational footprint for one club. Each decision remains reviewable and must be recorded before its first irreversible migration or production dependency.
