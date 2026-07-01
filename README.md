# Technical Diary

A personal technical diary built with [Astro](https://astro.build) (server-rendered),
[Netlify DB](https://docs.netlify.com/storage/netlify-db/) (Neon Postgres) via the
[Drizzle ORM](https://orm.drizzle.team), and a single-admin login. Entries are written
through a protected **New entry** form and stored in the database — no Markdown files to
commit.

## How posting works

1. Go to **Diary** and click **+ New entry** (or visit `/login`).
2. Log in with your admin username/password.
3. Fill in title, date, and body (Markdown supported) and hit **Publish**.
4. The entry is saved to the database and appears immediately at `/blog`.

## Local development

```sh
npm install
cp .env.example .env   # then fill in the values (see below)
npm run dev            # http://localhost:4321
```

You need a Postgres database for posts to load and save. Either point `.env` at a Neon
database (`DATABASE_URL=...`) or run through the Netlify CLI with `netlify dev`, which
injects `NETLIFY_DATABASE_URL` automatically once the site has a Netlify DB.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NETLIFY_DATABASE_URL` / `DATABASE_URL` | Postgres connection string |
| `ADMIN_USERNAME` | The one account allowed to post |
| `ADMIN_PASSWORD` | That account's password |
| `SESSION_SECRET` | Random string used to sign the login cookie |

### Database schema

The schema lives in [`src/lib/schema.ts`](src/lib/schema.ts). After changing it (or on
first setup) push it to the database:

```sh
npm run db:push       # apply the schema to the database
npm run db:studio     # optional: browse data in Drizzle Studio
```

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub → pick the repo.**
   The `@astrojs/netlify` adapter and `netlify.toml` are already configured.
3. Provision the database: install the Netlify CLI (`npm i -g netlify-cli`), run
   `netlify link`, then `netlify db init`. This creates a Neon database and sets
   `NETLIFY_DATABASE_URL` on the site.
4. Add the other env vars in **Site settings → Environment variables**:
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
5. Apply the schema against the production database once: with the production
   `NETLIFY_DATABASE_URL` in your local `.env`, run `npm run db:push`.
6. Deploy. Every future `git push` redeploys automatically.

## Project layout

- `src/lib/` — database (`db.ts`, `schema.ts`), auth (`auth.ts`), helpers.
- `src/middleware.ts` — loads the session and guards `/admin/*`.
- `src/pages/blog/` — diary index and individual entry pages (DB-backed).
- `src/pages/admin/new.astro` — the protected New entry form.
- `src/pages/api/` — `login`, `logout`, and `posts` (create) endpoints.
- `src/pages/login.astro` — the login page.
