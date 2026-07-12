# MVP launch checklist

## Product decisions

- [ ] Confirm physical club address and exact IANA timezone.
- [ ] Approve level labels and initial-rating mapping.
- [ ] Approve scoring formats, eligible rated-match types, tie-break sequences, and inactivity policy.
- [ ] Approve public player fields, photo consent, retention, deletion, and official privacy notice.
- [ ] Confirm email sender domain and Google sign-in credentials.

## Infrastructure

- [ ] Create production and staging PostgreSQL databases in an approved region.
- [ ] Configure point-in-time recovery, automated backups, and alerts.
- [ ] Complete and record a restore drill.
- [ ] Configure application, worker/cron, transactional email, object storage, error tracking, and uptime monitoring.
- [ ] Store secrets in managed secret storage; never copy `.env` files into images or source control.
- [ ] Monitor `/api/health/live` for process availability and `/api/health/ready` for dependency readiness.

## Security and privacy

- [ ] Complete Mexico privacy/legal review and publish the approved notice.
- [ ] Threat-model authentication, authorization, guest claims, score corrections, uploads, public projections, and exports.
- [ ] Enable administrator 2FA and test session revocation.
- [ ] Verify CSP and other security headers in staging.
- [ ] Run dependency, secret, and vulnerability scans.
- [ ] Test account export/deletion and consent withdrawal.

## Data and workflows

- [ ] Apply migrations in staging and run PostgreSQL integration tests.
- [ ] Create the owner account, club, location, courts, operating hours, blackouts, and level bands.
- [ ] Publish rating formula v1 and preserve its configuration snapshot.
- [ ] Seed realistic synthetic data and rehearse one event in every launch format.
- [ ] Verify simultaneous score confirmations, disputes, 24-hour confirmation, rating transactions, and notification deduplication.

## UX and operations

- [ ] Complete keyboard, screen-reader, contrast, zoom, reduced-motion, and large-touch-target review.
- [ ] Test English and Spanish on phones, tablets, desktop, and club TV.
- [ ] Test poor connectivity and PWA offline read fallback.
- [ ] Train owner, administrators, and tournament directors.
- [ ] Print the tournament-day and incident contact checklist.

## Release

- [ ] Run full CI from a connected remote repository.
- [ ] Review migration forward/rollback plan and take a verified backup.
- [ ] Deploy staging, run browser smoke/load tests, and approve release.
- [ ] Deploy production with new workflows initially restricted to staff/pilot users.
- [ ] Monitor errors, latency, database connections, delivery failures, and score disputes.
- [ ] Record go/no-go owner approval and rollback triggers.
