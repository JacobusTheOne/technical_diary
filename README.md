# Technical Diary

A personal technical diary built with [Astro](https://astro.build) (server-rendered),
[Netlify Blobs](https://docs.netlify.com/blobs/overview/), and a single-admin login.
Entries are written through a protected **New entry** form and stored in a site-level
blob — no Markdown files to commit.

## How posting works

1. Go to **Diary** and click **+ New entry** (or visit `/login`).
2. Log in with your admin username/password.
3. Fill in title, date, and body (Markdown supported) and hit **Publish**.
4. The entry is saved and appears immediately at `/blog`.

## Local development

```sh
npm install
cp .env.example .env   # then fill in the values (see below)
npm run dev            # http://localhost:4321
```

Run through the Netlify CLI with `netlify dev` to use Netlify Blobs locally.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME` | The one account allowed to post |
| `ADMIN_PASSWORD` | That account's password |
| `SESSION_SECRET` | Random string used to sign the login cookie |

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub → pick the repo.**
   The `@astrojs/netlify` adapter and `netlify.toml` are already configured.
3. Add the env vars in **Site settings → Environment variables**:
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
4. Deploy. The diary entries persist in a site-level Netlify Blobs store.

## Project layout

- `src/lib/` — posts storage (`posts.ts`), auth (`auth.ts`), helpers.
- `src/middleware.ts` — loads the session and guards `/admin/*`.
- `src/pages/blog/` — diary index and individual entry pages.
- `src/pages/admin/new.astro` — the protected New entry form.
- `src/pages/api/` — `login`, `logout`, and `posts` (create) endpoints.
- `src/pages/login.astro` — the login page.
