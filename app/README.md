# Punto

Punto is a bilingual, mobile-first padel club platform for players, verified results, ratings, events, schedules, standings, and public live information.

## Current milestone

The repository contains the product-discovery baseline and early vertical slices for:

- responsive player and public-event experiences;
- installable PWA shell and offline read fallback;
- club-scoped users, applications, roles, profiles, guests, locations, and courts;
- verified match-result state machine and audit boundaries;
- doubles-aware Glicko-2 calculations and immutable rating transactions;
- configurable standings tie-breaks;
- deterministic round-robin generation;
- court scheduling with rest, blackout, lock, and conflict handling.

Authentication-provider wiring and a deployed PostgreSQL database are not included yet.

See `../PROJECT_STATUS.md` for the explicit boundary between tested domain code, interactive demonstrations, and production-connected functionality.

## Requirements

- Node.js 20 or newer
- pnpm 11
- PostgreSQL for migrations and database-backed workflows

## Local development

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open `http://localhost:3000/demo` for the navigable product map. It links the player, public, and organizer demonstrations.

## Verification

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Generate SQL after an intentional schema change:

```bash
pnpm db:generate
```

Do not apply migrations to shared or production databases without reviewing the generated SQL and confirming backup/rollback readiness.

## Project documentation

- `../PRODUCT_DISCOVERY.md`
- `../PRODUCT_REQUIREMENTS.md`
- `../docs/adr/`
- `../docs/DATABASE.md`
