CREATE TABLE IF NOT EXISTS "result_series" (
  "id" INTEGER NOT NULL UNIQUE,
  "date" TEXT NOT NULL,
  "regime" INTEGER,
  "speed" INTEGER,
  "repetitions" INTEGER NOT NULL,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE INDEX IF NOT EXISTS "idx_result_series_date" ON "result_series"("date");

-- Если таблица уже создана со старой схемой (regime/speed NOT NULL), пересоздать:
-- CREATE TABLE "result_series_new" (
--   "id" INTEGER NOT NULL UNIQUE,
--   "date" TEXT NOT NULL,
--   "regime" INTEGER,
--   "speed" INTEGER,
--   "repetitions" INTEGER NOT NULL,
--   PRIMARY KEY ("id" AUTOINCREMENT)
-- );
-- INSERT INTO "result_series_new" SELECT * FROM "result_series";
-- DROP TABLE "result_series";
-- ALTER TABLE "result_series_new" RENAME TO "result_series";
-- CREATE INDEX IF NOT EXISTS "idx_result_series_date" ON "result_series"("date");
