# Security and privacy plan

## Trust boundaries

- Browser and PWA data are untrusted.
- Authentication proves user identity; club application state and role assignments separately determine authorization.
- Authorization is resource- and club-scoped on the server for every protected command/query.
- Background workers authenticate with narrowly scoped service credentials and call the same application commands as web requests.
- Public pages receive dedicated allow-listed projections.

## Required controls

- Secure, HTTP-only, SameSite cookies; session rotation after sign-in and privilege changes.
- Short-lived, one-use magic links stored as hashes; generic responses prevent account discovery.
- Google OAuth with state, PKCE, strict redirect allow-list, and verified email handling.
- Administrator 2FA before production; step-up authentication for staff/role, formula, export, deletion, and sensitive correction actions.
- CSRF protection for cookie-authenticated mutations; strict Origin validation.
- Zod/schema validation at every ingress and PostgreSQL parameterization.
- Contextual output encoding, restrictive Content Security Policy, clickjacking protection, MIME sniffing prevention, and conservative referrer policy.
- Per-IP and per-identity rate limits for authentication, score submission, invitations, claims, uploads, and public streams.
- File type/signature checks, size limits, randomized object keys, malware scan, private-by-default storage, and expiring signed access URLs.
- Secrets only in managed secret storage; separate development/staging/production credentials and rotation procedures.

## Sensitive workflows

- Result corrections append new submissions/reversal transactions; history is never overwritten.
- Guest claims preserve competition identity and require signed, expiring, single-use tokens.
- Duplicate-profile merge requires preview, elevated permission, audit reason, and transaction rollback.
- Formula publication requires owner permission and simulation preview; historical transactions retain their formula snapshot.
- Exports and deletion requests are audited, identity-reverified, and processed asynchronously.

## Mexico privacy baseline

Before production, obtain qualified review against applicable Mexican privacy requirements, including privacy notices, consent, data-subject rights, processors/transfers, breach procedures, and retention. This engineering plan is not legal advice.

MVP privacy defaults:

- No junior accounts.
- Public player photo disabled unless explicitly consented.
- Public profiles expose display name, rating/ranking, and competition results only when allowed by club policy and player consent.
- Phone, email, availability, application notes, disputes, and membership state are never public.
- Capture notice version, consent purpose, timestamp, source, and withdrawal.

## Retention proposals for owner/legal approval

- Authentication tokens: until used or expired; delete promptly afterward.
- Rejected/incomplete applications: 12 months.
- Audit and official competition ledgers: 7 years unless policy/law requires another period.
- Notification delivery logs: 90 days; aggregate metrics may be retained without message content.
- Uploaded score evidence: 90 days after dispute resolution.
- Account deletion anonymizes competition identity where deleting it would corrupt other players' official history; direct identifiers are removed.

## Operational readiness

- Dependency and secret scanning in CI.
- Threat-model review before authentication, uploads, and production launch.
- Automated backup plus quarterly restore exercise.
- Incident roles, severity model, evidence preservation, notification decision tree, and session/credential revocation runbook.
- Centralized security/audit telemetry with access restricted and monitored.
