CREATE TABLE IF NOT EXISTS posts (
  id         serial PRIMARY KEY,
  slug       text NOT NULL,
  title      text NOT NULL,
  body       text NOT NULL,
  pub_date   timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_idx ON posts (slug);
