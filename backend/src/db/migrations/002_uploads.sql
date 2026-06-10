CREATE TABLE IF NOT EXISTS uploads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename   TEXT        NOT NULL DEFAULT '',
  mime       VARCHAR(64) NOT NULL DEFAULT 'image/jpeg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE memos ADD COLUMN IF NOT EXISTS images JSONB;
