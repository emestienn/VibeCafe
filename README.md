# VIBECAFE

Find your vibe. Find your place. Share your experience. Find your people.

VIBECAFE is a café discovery and social platform for freelancers, students, remote workers, and developers — combining mood-based AI recommendations, an Instagram/Pinterest-style photo feed, reviews and menus, and a networking + follow layer that connects people at the same café. Fully multilingual: **Uzbek (default), Russian, English.**

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **i18n:** next-intl (cookie-based locale, no URL prefixing) — `messages/{uz,ru,en}.json`
- **Styling:** Tailwind CSS v4, hand-built UI primitives on Radix UI + CVA, Framer Motion
- **Database:** PostgreSQL via Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- **Auth:** Auth.js (NextAuth v5) — Google OAuth + email/password (Credentials)
- **Data fetching:** Server Components + Route Handlers, TanStack Query on the client
- **Forms:** React Hook Form + Zod
- **Image uploads:** local disk (`public/uploads/`) in dev; falls back to inline data URLs automatically on read-only filesystems (e.g. Vercel) — see note below

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

This project was built against a local Homebrew PostgreSQL instance (no Docker required):

```bash
brew install postgresql@16
brew services start postgresql@16
createdb vibecafe
```

Any Postgres instance works — update `DATABASE_URL` in `.env` to match.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — your Postgres connection string
- `AUTH_SECRET` — random secret (generate with `npx auth secret`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional; leave blank to disable "Continue with Google" and use email/password only

### 4. Push the schema and seed data

```bash
npm run db:push
npm run db:seed
```

Seeds 20 cafés (menus, images, amenities), 30 users, 50 reviews, 10 events, ~90 social posts (café posts + "My Vibe" posts) with photos/likes/comments/saves, ~90 follow relationships, active "Work With Me" sessions, connections, and favorites — all realistic, multilingual-flavored content, no Lorem Ipsum.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The interface loads in **Uzbek by default** — switch languages from the `UZ / RU / EN` selector in the navbar (persisted via cookie).

### Demo accounts

| Email | Password | Role |
|---|---|---|
| `admin@vibecafe.app` | `admin1234` | Admin (full dashboard access) |
| any other seeded user | `password123` | Regular user |

Browse seeded users with `npm run db:studio` (Prisma Studio).

## Deploying to Vercel

### 1. Push this repo to GitHub

Create an empty repo on [github.com/new](https://github.com/new) (no README/license — this repo already has one), then:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Create a Neon database

1. Go to [neon.tech](https://neon.tech) → sign up → **New Project**.
2. In the project dashboard, copy the **pooled** connection string (toggle "Pooled connection" — serverless functions open many short-lived connections, and the pooled string handles that correctly). It looks like:
   `postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require`

### 3. Import the repo in Vercel

[vercel.com/new](https://vercel.com/new) → import the GitHub repo → it auto-detects Next.js, no build config changes needed.

### 4. Set environment variables

In the Vercel project → Settings → Environment Variables (add for **Production** and **Preview**):

| Variable | Value |
|---|---|
| `DATABASE_URL` | the pooled Neon connection string from step 2 |
| `AUTH_SECRET` | generate locally with `npx auth secret` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional — if set, add `https://<your-domain>/api/auth/callback/google` to the OAuth client's authorized redirect URIs in Google Cloud Console |

`NEXTAUTH_URL` doesn't need to be set — `trustHost: true` in `src/lib/auth.ts` lets Auth.js infer the correct URL on both Production and Preview deployments.

### 5. Push the schema and seed data to Neon

Run once, locally, pointed at the Neon connection string (either the pooled one above, or Neon's **unpooled** string — `db push`/seeding are one-shot scripts, not long-lived serverless functions, so either works):

```bash
DATABASE_URL="<your-neon-connection-string>" npm run db:push
DATABASE_URL="<your-neon-connection-string>" npm run db:seed
```

### 6. Deploy

Vercel builds automatically on push (`postinstall` runs `prisma generate` before the build). The first deploy kicks off as soon as you import the repo in step 3; every subsequent push to `main` redeploys automatically.

## Notable implementation choices

- **Internationalization** uses next-intl in cookie-based mode (no `/uz/...` URL prefixing) — simpler to maintain than full i18n routing while still giving every page a fully translated interface, a visible language switcher, and an easy path to add a fourth language (drop a new `messages/xx.json` file and register it in `src/i18n/config.ts`). User-generated content (reviews, captions, bios) is stored as entered and is not auto-translated — the same behavior as real social apps.
- **Image uploads** (post photos) are written to `public/uploads/` on local disk via a Next.js Route Handler — no third-party account needed to run the app. On a read-only filesystem (Vercel's serverless functions), the same route automatically falls back to returning inline base64 data URLs instead of crashing. That's a stopgap, not a production image pipeline — swap `src/app/api/upload/route.ts` for Vercel Blob, Cloudinary, or Supabase Storage once you need uploads to persist across requests/deploys and not bloat the database.
- **The interactive map** is a custom-built, stylized component (CSS grid background + projected lat/lng pins with hover cards) rather than a real Mapbox/Google Maps integration, so the app runs without a maps API key. The café `lat`/`lng` fields are real and ready to feed into Mapbox GL if you want to swap it in later.
- **Vibe AI** is a deterministic, multilingual keyword-based recommendation assistant (`src/lib/vibe-ai.ts`) — it parses natural-language requests (in UZ/RU/EN) into mood/filter combinations, runs them through the same scoring engine as Discover, computes a percentage match breakdown (mood/work/wifi/atmosphere/price), and can surface "potential connections" — people open to networking who share the requester's interests. It is not wired to a hosted LLM.
- **Social graph** has two distinct relationships by design: **Follow** (one-directional, Instagram-style, no approval) for the social feed, and **Connection** (two-directional, requires acceptance) for professional networking — matching the spec's distinction between casual following and deliberate networking.
- **Vibe Score** and mood-matching are computed from weighted café attributes in `src/lib/cafe-score.ts` — adjust the weights there to change how recommendations feel.

## Known gaps (scoped out for this pass)

- Stories (24h-expiring posts) — schema/UI not built.
- A dedicated single-post detail page/URL — posts are currently viewed inline in the feed/profile/café community grid only.
- Like/save state on the profile "Posts" tab and in café "Recent posts" doesn't reflect the viewer's own like/save status on load (toggling still works correctly).
- Some lower-traffic strings (DB-stored amenity names, interests, review tags, work-session categories) remain in English by design — translating stored data would need per-locale fields or a translation table, a materially bigger change than translating UI chrome.

## Project structure

```
prisma/schema.prisma      Full data model (25+ models: users, cafés, posts, comments, likes, follows, reviews, events, connections, etc.)
prisma/seed.ts             Realistic mock data generator
messages/{uz,ru,en}.json   Translation catalogs
src/i18n/                   next-intl config (locale list, cookie-based request config)
src/app/                     Routes (App Router)
src/components/              UI, organized by domain (post, cafe, community, events, profile, admin, ai, layout, ui)
src/lib/data/                 Server-only Prisma query modules
src/lib/cafe-score.ts        Vibe score, mood matching, interest matching, highlight-tag logic
src/lib/vibe-ai.ts             Multilingual natural-language query parsing + match-breakdown for the AI assistant
```
