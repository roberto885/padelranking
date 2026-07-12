# Staging provisioning runbook

**Decisions locked July 11, 2026:** Vercel (hosting) + Neon (PostgreSQL, AWS us-east-1) + Resend (email) + private GitHub repository. Pilot runs on the free `*.vercel.app` subdomain; a custom domain and verified email sender come later. Timezone `America/Matamoros`, three level bands (1100/1500/1900), public names with private photos — all already the code defaults.

Steps marked 👤 need the owner (account sign-ins and credentials); steps marked 🤖 Claude can run once the 👤 steps before them are done.

## 1. GitHub 👤

The Mac has no GitHub credentials (no `gh`, no PAT, no SSH keys).

1. Create a **private** repository at github.com/new (suggested name `punto-padel`). Do not initialize with README.
2. Authorize this machine — easiest is a fine-grained personal access token limited to that repo with **Contents: read/write** (github.com → Settings → Developer settings → Fine-grained tokens), or add an SSH key.
3. Tell Claude the repo URL, then 🤖: `git remote add origin <url> && git push -u origin main` (with a PAT, the remote is `https://<token>@github.com/<user>/punto-padel.git`; the token can also go in the macOS keychain via `git credential-osxkeychain` so it never lives in the repo config).
4. CI runs automatically on push — it applies migrations to PostgreSQL 17 and runs the 12 currently-skipped integration tests. No repository secrets are required.

## 2. Neon (database) 👤 — **done July 11, 2026**

Project created in AWS us-east-1 (PostgreSQL 17, host `ep-red-mode-atcldikr.c-9.us-east-1.aws.neon.tech`, database `neondb`). All 10 migrations applied, 147/147 tests pass against it, and the seed created club `Rincon del Bosque` (slug `rincon-del-bosque`, club ID above) with the owner account `roberto@themustanggroup.com`, one location, three level bands, and four outdoor courts. The connection string is in the Neon dashboard → Connect (use the pooled variant for Vercel).

## 3. Vercel (hosting) 👤 then 🤖

1. Sign up at vercel.com and import the GitHub repository (framework: Next.js, root directory `app`).
2. Note the assigned URL, e.g. `https://punto-padel.vercel.app` — this is `APP_URL` for the pilot.
3. Set the environment variables below in Vercel → Project → Settings → Environment Variables.

| Variable | Value | Note |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | |
| `APP_URL` | `https://<project>.vercel.app` | production env uses https ✓ |
| `AUTH_SECRET` | output of `openssl rand -base64 48` | generate fresh; store only in Vercel |
| `EMAIL_FROM` | `onboarding@resend.dev` (test mode) | switch to `avisos@<domain>` after domain |
| `EMAIL_PROVIDER_API_KEY` | Resend API key (step 4) | |
| `NEXT_PUBLIC_CLUB_ID` | `ba852ad1-7627-4e78-b4c7-d841f32c1ab5` | Rincon del Bosque, seeded July 11, 2026 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | leave unset for now | see step 7 |

## 4. Resend (email) 👤

1. Sign up at resend.com (free tier: 3,000/month) and create an API key.
2. **Test-mode limitation:** without a verified domain, Resend only delivers to the account owner's own email address — magic links work for the owner only. Staff/synthetic accounts need step 7 (domain) or can use the Google button once step 7's OAuth exists. For the first smoke test this is fine.

## 5. Migrations and seed 🤖 (needs `DATABASE_URL` from step 2)

```bash
cd app
DATABASE_URL=<neon-direct-url> pnpm db:migrate
DATABASE_URL=<neon-direct-url> SEED_OWNER_EMAIL=roberto@themustanggroup.com \
  SEED_CLUB_NAME="<club name>" SEED_CLUB_SLUG=<slug> SEED_OWNER_NAME="<owner name>" \
  pnpm db:seed   # prints {"clubId": ...} → NEXT_PUBLIC_CLUB_ID
DATABASE_URL=<neon-direct-url> pnpm test   # runs the 12 integration tests for real
```

The seed is idempotent (safe to re-run) and creates: owner user + approved membership + owner role, the club (`America/Matamoros`, MXN, es-MX), one location, the three level bands, four outdoor courts.

## 6. Connected-slice validation 🤖/👤

Magic link to the owner address → `/solicitud` application with a second (synthetic) account → owner reviews in `/admin/solicitudes` → first decision triggers TOTP enrollment (authenticator app) → approve → `/api/v1/me` shows the approved membership. This is milestone step 3 in `PROJECT_STATUS.md`.

## 7. Later: custom domain, real sender, Google OAuth 👤

1. Buy a domain (~US$10–15/yr, Cloudflare or Namecheap), add it to the Vercel project, update `APP_URL`.
2. Verify the domain in Resend (3 DNS records), switch `EMAIL_FROM` to `avisos@<domain>` — unlocks magic links for everyone.
3. Google Cloud console → new project → OAuth consent screen (External, testing mode with named test users is enough for the pilot) → Web application credentials with redirect URI `https://<domain>/api/v1/auth/google/callback` → set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in Vercel. The sign-in button activates automatically.
4. Sign the DPA in the Vercel, Neon, and Resend dashboards (see `docs/legal/CONSENTIMIENTO_Y_RETENCION.md`), fill the bracketed fields in `docs/legal/AVISO_PRIVACIDAD.md`, and publish it at `/privacidad` before any real player data.
