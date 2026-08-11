CREATE TABLE IF NOT EXISTS "result_series" (
  "id" INTEGER NOT NULL UNIQUE,
  "date" TEXT NOT NULL,
  "regime" INTEGER,
  "speed" INTEGER,
  "repetitions" INTEGER NOT NULL,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE INDEX IF NOT EXISTS "idx_result_series_date" ON "result_series"("date");
