# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A student-practice REST API: Express 5 + Prisma + PostgreSQL. It exposes simple, consistent CRUD resources so students can practice fetching, filtering, searching, pagination, and writes from a frontend. Keep it **beginner-readable** — prefer clarity over cleverness. The npm package name (`ethiopi-aregions-api`) is stale from an earlier version; the project is now "Tayokod Practice API" (see README.md).

## Commands

```bash
npm install                 # install deps (zod, express, prisma, cors, dotenv)
npm run dev                 # nodemon dev server (auto-restart)
npm start                   # plain node server
npm run seed                # populate DB with practice data (rerun-safe)

npx prisma migrate dev --name <change>   # create+apply a migration after editing schema.prisma
npx prisma migrate deploy                # apply existing migrations (production)
npx prisma generate                      # regenerate client after schema change
npx prisma studio                        # browse the DB
```

There is **no test runner, linter, or build step.** Verification is done by running the server against a database and exercising endpoints with `curl`/`fetch` (see "Verifying changes" below).

### Environment

`.env` (gitignored) must define:
- `DATABASE_URL` — Prisma reads exactly this name. If a connection URL is only available as `DATABASE_PUBLIC_URL` (e.g. Railway), mirror it into `DATABASE_URL`.
- `API_KEY` — **required**; the server throws on startup if it is missing.
- `PORT` — optional, defaults to 3000.

## Architecture

Request flow: `server/index.js` → global `authMiddleware` → per-resource router (`routes/**`) → controller (`controllers/**`) → shared Prisma client → `errorHandler`.

**Everything mounts under `/api`.** Each resource has a route file and a controller in its own folder. Some folder names are misspelled (`categoreisRoutes`, `zonesConrollers` historically) — match existing names, don't "fix" them casually since imports depend on them.

Four conventions make the codebase uniform; follow them when adding or changing a resource:

1. **One shared Prisma client** — `lib/prisma.js` exports a single `PrismaClient`. Never call `new PrismaClient()` in a controller (that would open extra connection pools).

2. **Controllers throw, they don't try/catch.** Express 5 forwards rejected async handlers to the central `errorHandler` in `lib/errors.js`. That handler is the single place status codes are decided:
   - `ApiError` (from `lib/errors.js`) → its status. Throw `new ApiError(404, 'X not found')` for missing records after a `findUnique`.
   - Zod error → 400 with field details
   - Prisma `P2002` → 409 (duplicate unique), `P2025` → 404 (record not found on update/delete), `P2003` → 400 (bad foreign key)
   - anything else → logged + 500
   `errorHandler` must stay registered **last** in `server/index.js`, after a JSON 404 catch-all.

3. **All validation lives in `lib/validate.js`** as Zod schemas — never inline. Route `:id` params go through `parseId()` (coerces + rejects non-positive-int with a 400). Each resource has `xCreateSchema`, `xUpdateSchema` (create schema `.partial()` + non-empty check), and `xQuerySchema` for query strings. Controllers call `schema.parse(req.body)` / `schema.parse(req.query)` and let failures throw.

4. **List endpoints use `lib/paginate.js`.** `paginate(model, {where, include, orderBy}, {page, limit})` returns a **plain array** when neither `page` nor `limit` is passed (back-compat), and a `{ data, pagination: {page, limit, total, totalPages} }` envelope when either is. `sortToOrderBy('-price')` → `{price:'desc'}`. Filters are built as a `where` object from parsed query fields; string matches use `{ contains, mode: 'insensitive' }`.

### Auth model

`authMiddleware` (in `server/index.js`) allows `GET`/`HEAD`/`OPTIONS` through unauthenticated; **every other method** requires a correct `x-api-key` header or gets 403. This is deliberately inverted (allowlist reads) so a newly-added method like `PATCH` can't accidentally bypass auth. GET endpoints are public; all writes are protected.

### Resources & relations

Active models (`prisma/schema.prisma`): `foods`↔`categories`, `Product` (standalone), `Student`→`Mark`, `Author`→`Book`, `Company`→`Job`, `City` (standalone). Parent deletes **cascade** to children (deleting a Student removes its Marks, etc.). Regions/Zones were removed — don't reintroduce them.

Note the mixed model-naming: `foods` and `categories` are lowercase/plural (older), the rest are PascalCase/singular. Use each model's actual name as written in the schema.

Domain rule worth knowing: **Marks auto-compute `status`** — if a create/update omits `status`, the controller sets `score >= 50 ? 'Passed' : 'Failed'`, and recomputes it when `score` changes.

## Data-update scripts (`scripts/`)

One-off scripts that write directly to the database (`add-somali-foods.js`, `update-books.js`), separate from `prisma/seed.js`. House style for these, worth preserving:
- **rerun-safe** (upsert / idempotent update; no blind inserts)
- a `--dry-run` flag that reports what would change and writes nothing
- wrapped in `prisma.$transaction(..., { timeout: 120000, maxWait: 15000 })` — the generous timeout matters for **remote** databases (the default 5s times out over a proxy connection)
- touch only their target tables; never delete unrelated data; report (don't delete) duplicates
- run with `node --env-file=.env scripts/<name>.js`

When picking image URLs for practice data, use stable public sources (Wikimedia Commons `upload.wikimedia.org`, Unsplash CDN) and HTTP-verify each URL before committing it.

## Verifying changes

No automated tests exist, so after non-trivial changes, actually run it: start the server against a database and hit the endpoints. For an isolated check without a real DB, a throwaway local Postgres works (`initdb` + `pg_ctl` on an alt port with `unix_socket_directories=''` since long socket paths fail), then `prisma migrate deploy` + `npm run seed`. Confirm: GETs work without a key; writes 403 without/with a wrong key and succeed with `x-api-key`; invalid id → 400; missing → 404; duplicate unique → 409; bad FK → 400.

## Deployment

Hosted on Railway, auto-deploying from GitHub `main`. Inside Railway the app should use the **internal** `postgres.railway.internal` URL; the `proxy.rlwy.net` public URL is only for connecting from outside (like local scripts). Commit source only — never `.env`.
