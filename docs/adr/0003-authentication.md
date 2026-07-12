# ADR 0003: Passwordless email and Google authentication

**Status:** Accepted for Phase 1; provider selection pending  
**Date:** 2026-07-11

## Decision

Launch with email magic links and Google sign-in. Do not maintain password credentials in the MVP. Require verified email ownership, secure HTTP-only sessions, revocation, short-lived one-time magic links, and two-factor authentication for administrators before production.

Authentication establishes identity only. Club application status and role assignments are evaluated separately for every protected operation.

## Consequences

- Players get a low-friction sign-in path without password-reset operations.
- Email delivery becomes a launch dependency.
- Apple sign-in and passwords can be added later without changing player competition identities.
