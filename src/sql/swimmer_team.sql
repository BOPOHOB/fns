CREATE TABLE IF NOT EXISTS "swimmer_team" (
  "swimmer_id" INTEGER NOT NULL,
  "team_id" INTEGER NOT NULL,
  PRIMARY KEY ("swimmer_id", "team_id"),
  FOREIGN KEY ("swimmer_id") REFERENCES "swimmer"("id") ON DELETE CASCADE,
  FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS "idx_swimmer_team_team_id" ON "swimmer_team"("team_id");
