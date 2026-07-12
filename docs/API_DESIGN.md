# API design

## Conventions

- Base path: `/api/v1`.
- JSON request and response bodies; UTF-8.
- Authentication uses a secure server session. Public reads are explicitly marked public.
- Every protected club request resolves the club from the resource or route and authorizes it server-side. A client-supplied role is never trusted.
- Mutation requests require `Idempotency-Key`; responses echo it.
- Dates are ISO 8601 instants in UTC. Club and location resources expose IANA timezone names.
- Collection pagination uses opaque `cursor` and bounded `limit`.
- Errors use `{ "error": { "code", "message", "fieldErrors?", "requestId" } }`.
- Optimistic concurrency uses a resource `version`; stale writes return `409 VERSION_CONFLICT`.

## Identity and applications

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/magic-link` | Public, rate limited | Request one-time email sign-in link |
| GET | `/auth/google/start` | Public | Begin Google sign-in |
| POST | `/auth/logout` | Signed in | Revoke current session |
| GET | `/me` | Signed in | Current identity, applications, roles, preferences |
| POST | `/clubs/{clubId}/applications` | Signed in | Submit open club application |
| GET | `/clubs/{clubId}/applications` | Player reviewer | Review queue |
| POST | `/clubs/{clubId}/applications/{id}/decision` | Player reviewer | Approve/reject with level and reason |

## Players, guests, courts

| Method | Path | Access |
|---|---|---|
| GET/PATCH | `/clubs/{clubId}/players/me` | Approved player |
| GET | `/clubs/{clubId}/players` | Club staff |
| POST | `/clubs/{clubId}/guests` | Club staff |
| POST | `/clubs/{clubId}/guests/{id}/claim-token` | Club staff |
| POST | `/guest-claims/{token}` | Signed in |
| GET/POST | `/clubs/{clubId}/courts` | Read: approved player; write: court manager |
| PATCH | `/clubs/{clubId}/courts/{id}` | Court manager |

Guest claim tokens are hashed at rest, single-use, scoped to one profile, and expire.

## Matches and results

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/clubs/{clubId}/matches` | Approved player/staff | Creates match and participants |
| GET | `/clubs/{clubId}/matches/{id}` | Participant/staff | Private match detail |
| POST | `/clubs/{clubId}/matches/{id}/score-submissions` | Participant/staff | Requires idempotency key |
| POST | `/clubs/{clubId}/score-submissions/{id}/confirm` | Opponent/staff | Opposing team restriction |
| POST | `/clubs/{clubId}/score-submissions/{id}/dispute` | Opponent/staff | Reason required |
| POST | `/clubs/{clubId}/matches/{id}/administrative-result` | Authorized staff | Reason and audit snapshot required |

Confirmation uses a row lock and one transaction for the official result, player projections, four rating transactions, rankings, notifications, and audit event. The 24-hour worker invokes the same confirmation command.

## Events and registration

| Method | Path | Access |
|---|---|---|
| GET | `/public/clubs/{clubSlug}/events` | Public |
| POST | `/clubs/{clubId}/events` | Event manager |
| POST | `/clubs/{clubId}/events/{id}/categories` | Event manager |
| POST | `/clubs/{clubId}/categories/{id}/registrations` | Eligible approved player/staff |
| DELETE | `/clubs/{clubId}/registrations/{id}` | Registrant/staff |
| POST | `/clubs/{clubId}/categories/{id}/generate` | Event manager |
| POST | `/clubs/{clubId}/categories/{id}/schedule-versions` | Event manager |
| POST | `/clubs/{clubId}/schedule-versions/{id}/approve` | Event manager |
| POST | `/clubs/{clubId}/events/{id}/publish` | Event manager |

Generation responses contain the deterministic seed/version and warnings. Publication returns all blocking readiness issues in one response.

## Public live resources

| Method | Path | Cache policy |
|---|---|---|
| GET | `/public/events/{eventSlug}` | Short public cache |
| GET | `/public/events/{eventSlug}/schedule` | Short cache + ETag |
| GET | `/public/events/{eventSlug}/standings` | Short cache + ETag |
| GET | `/public/events/{eventSlug}/bracket` | Short cache + ETag |
| GET | `/public/events/{eventSlug}/stream` | SSE, public safe projection |

Public serializers use explicit field allow-lists. They never reuse private player or registration objects.

## Ratings

| Method | Path | Access |
|---|---|---|
| GET | `/public/clubs/{clubSlug}/rankings` | Public safe projection |
| GET | `/clubs/{clubId}/players/{id}/rating-history` | Player/self or staff |
| POST | `/clubs/{clubId}/rating-formulas/simulations` | Owner/admin |
| POST | `/clubs/{clubId}/rating-formulas/{id}/publish` | Owner |

History returns formula version, before/after values, expected probability, confidence, and explanation. Simulations cannot mutate official history.

## Background jobs

- Confirm undisputed submissions whose `confirm_after` deadline has passed.
- Deliver due notification-outbox records with exponential backoff and dead-letter review.
- Refresh published standing projections after confirmed results.
- Expire guest-claim and sign-in tokens.

Every job is idempotent, has a stable deduplication key, and records attempts without changing business truth on delivery failure.
