CREATE TABLE IF NOT EXISTS "swimmer" (
  "id" INTEGER NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "birth_date" TEXT,
  "sex" TEXT NOT NULL CHECK ("sex" IN ('male', 'female')),
  "notes" TEXT NOT NULL DEFAULT '',
  "private_notes" TEXT NOT NULL DEFAULT '',
  PRIMARY KEY ("id" AUTOINCREMENT)
);
