# Database development

The application requires PostgreSQL. Set `DATABASE_URL` from `app/.env.example`, then run migrations from the `app` directory with Drizzle Kit.

The result-confirmation adapter uses a row lock on the match and one PostgreSQL transaction for player rating projections, immutable rating transactions, match confirmation, and the audit record. The unique `(match_id, player_profile_id)` rating index is the final duplicate-write guard.

A PostgreSQL server is not bundled in this workspace. Unit tests exercise rollback and retry semantics through the same transaction interface; database integration tests must run in CI against an ephemeral PostgreSQL service before deployment.

## Staging seed

After migrations, set the explicit `SEED_*` values from `.env.example` and run `pnpm db:seed`. The idempotent seed creates one owner, approved club application, owner role, player profile, principal location, three rating bands, and four outdoor courts. It refuses production unless `ALLOW_PRODUCTION_SEED=true` is deliberately supplied.
