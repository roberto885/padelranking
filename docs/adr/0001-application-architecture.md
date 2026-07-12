# ADR 0001: Modular Next.js application

**Status:** Accepted for Phase 1  
**Date:** 2026-07-11

## Context

The first release serves one private club and needs a responsive PWA, server-rendered public pages, authenticated administration, background confirmation jobs, and stable boundaries for future native clients. A separate frontend and backend would add deployment, authentication, and observability overhead before usage requires it.

## Decision

Start with a modular TypeScript monolith using Next.js App Router. Organize business logic into framework-independent domain and application modules. Route handlers and server actions are adapters, not the home of rating, scheduling, authorization, or result-state logic.

Use PostgreSQL as the source of truth. Commands that confirm results and create rating/ranking/audit effects execute in a single database transaction. Expose versioned HTTP endpoints when an external client needs them; do not split a service merely to create an internal API.

## Consequences

- One deployable application and one primary database keep Phase 1 operations small.
- Server rendering supports fast public and authenticated experiences.
- Domain isolation is enforced by module boundaries and tests rather than network boundaries.
- A separate API can be extracted later if native clients, scaling, staffing, or deployment constraints justify it.

## Revisit triggers

- Independently deployed native clients require a formal public API lifecycle.
- Background workloads cannot safely share the application runtime.
- Different teams need independent release cadence.
- Compliance requires isolated services or infrastructure.
