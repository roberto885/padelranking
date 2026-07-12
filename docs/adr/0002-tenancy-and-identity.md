# ADR 0002: Club-scoped tenancy and separable player identity

**Status:** Accepted for Phase 1  
**Date:** 2026-07-11

## Decision

Every club-owned aggregate carries a non-null club identifier. Application services require an explicit club context and authorize the actor on the server. Database indexes and uniqueness constraints include the club identifier where identity is tenant-local.

A user is an authentication identity. A player profile is a competition identity and may exist without a user while it represents a guest. Claiming a guest links a user to the existing player profile; it never replaces the profile or rewrites match history.

Open application creates an authentication identity and a pending club application. It does not grant membership, verified level, event eligibility, or staff permission.

## Consequences

- The MVP UI can show one club while the data model remains safe for future clubs.
- Guest history survives account claiming.
- Authorization tests must cover cross-club identifiers and pending/suspended users.
