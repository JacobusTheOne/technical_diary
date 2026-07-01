# Technical Diary

A personal technical diary built with [Astro](https://astro.build) (server-rendered),
[Netlify Blobs](https://docs.netlify.com/blobs/overview/), and a single-admin login.
Entries are written through a protected **New entry** form and stored in a site-level
blob — no Markdown files to commit.

## How posting works

1. Go to **Diary** and click **+ New entry** (or visit `/login`).
2. Log in with your admin username/password.
3. Fill in title, date, and body (Markdown supported) and hit **Publish**.
4. The entry is saved and appears immediately at `/blog`. Edit it later from the
   **Edit** button on the entry page.

## Todos

The **Todos** tab is private — it only appears in the header when you're logged in,
and all its pages live under the auth-guarded `/admin/todos`. Add a todo by pasting
a filled-out JSON template (a single object, or an array to add several at once):

```json
{
  "title": "Short name of the todo",
  "goal": "The overall goal / why it matters",
  "timeEstimateHours": 2,
  "priority": "high",
  "ideas": ["First idea", "Another idea"],
  "steps": [{ "text": "Sub-task", "done": false }],
  "notes": "Any extra details"
}
```

Only `title` is required; everything else is optional. Estimates are numeric hours,
and the list shows a running **open estimate** total. Todos track **done/open**
status (Mark done / Reopen), and **Edit** reopens a todo as JSON. Todos are stored
in their own Netlify Blobs store, separate from diary entries.

## Languages

A **EN / PT-BR** button in the header switches the interface language; the choice
is remembered in a `lang` cookie and applies site-wide. It translates the UI
chrome (navigation, forms, buttons, dates) and the Home/About pages. Diary
entries are written once in whatever language you choose and display as authored.

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
