# Testing and deployment plan

## Test layers

1. Pure unit tests: pairing, brackets, tie-breaks, score validation, rating, scheduling, eligibility, publication, notifications.
2. PostgreSQL integration tests: migrations, constraints, tenant isolation, locking, result/rating atomicity, rollback, concurrent confirmation, and outbox deduplication.
3. Route tests: authentication, permissions, validation, idempotency, errors, and public field allow-lists.
4. Browser tests: open application, guest claim, registration/wait list, event creation/publication, score submission/confirmation/dispute, public live pages, language switching, and PWA fallback.
5. Accessibility: automated checks plus keyboard, screen-reader, zoom, contrast, focus, and reduced-motion manual review.
6. Load tests: public event reads/SSE, score bursts between rounds, schedule publication, and TV polling.

CI must run lint, TypeScript, unit tests, migration drift checks, PostgreSQL integration tests, production build, browser smoke tests, dependency audit, and secret scan.

## Environments

- Local: local/ephemeral PostgreSQL and development email sink.
- Preview: isolated database or branch schema; synthetic data only.
- Staging: production-equivalent configuration, sanitized data, email/push sandbox.
- Production: Mexico-appropriate/owner-approved region, managed PostgreSQL, object storage, email, monitoring, and backups.

## Deployment topology

- Next.js application on a managed platform.
- Managed PostgreSQL with point-in-time recovery and encrypted connections/storage.
- Background worker/cron for deadlines and outbox delivery.
- Object storage for photos/evidence.
- Transactional email provider; push via web-push-compatible provider.
- Error tracking, structured logs, uptime checks, product analytics with privacy controls.
- SSE initially for public live updates, with polling fallback. Introduce a managed real-time service only after measured need.

## Release process

1. Merge reviewed, green change.
2. Deploy preview; run smoke/accessibility checks.
3. Back up and verify migration rollback/forward plan.
4. Apply backward-compatible migration.
5. Deploy application with feature flags disabled where appropriate.
6. Run production smoke tests and inspect error/latency dashboards.
7. Enable feature gradually; monitor explicit rollback triggers.

Never deploy a destructive migration in the same release that stops reading the old schema. Use expand/migrate/contract.

## Recovery targets to approve

- Proposed RPO: 15 minutes.
- Proposed RTO: 4 hours.
- Daily automated backups plus point-in-time recovery.
- Quarterly restore drill and documented evidence.

## Operating-cost categories

- Application/worker compute and bandwidth.
- Managed PostgreSQL storage, compute, backups, and replicas.
- Object storage and image delivery.
- Transactional email and web push.
- Error tracking, logs, uptime, and analytics.
- Domain, DNS, certificates, and optional CDN/WAF.
- Support, privacy/legal review, and security testing.

Payments, SMS/WhatsApp, weather data, and managed real-time infrastructure are excluded from MVP cost until enabled.
