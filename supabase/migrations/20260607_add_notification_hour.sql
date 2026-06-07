ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS notification_hour smallint NOT NULL DEFAULT 9;
