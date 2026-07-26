CREATE TABLE IF NOT EXISTS "result" (
  "id" INTEGER NOT NULL UNIQUE,
  "swimmer_id" INTEGER NOT NULL,
  "result" INTEGER NOT NULL,
  "distance" INTEGER NOT NULL CHECK ("distance" IN (
    25, 50, 100, 200, 400, 500, 800, 1000, 1500,
    2000, 3000, 5000, 10000, 1852, 3704
  )),
  "date" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('competition', 'test', 'workout')),
  "stages" TEXT NOT NULL DEFAULT '[]',
  "notes" TEXT NOT NULL DEFAULT '',
  "series_id" INTEGER,
  "water" TEXT NOT NULL CHECK ("water" IN ('quarter', 'fifty', 'open')),
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("series_id") REFERENCES "result_series"("id") ON DELETE CASCADE,
  FOREIGN KEY ("swimmer_id") REFERENCES "swimmer"("id") ON DELETE CASCADE
);

-- История пловца (покрывает и фильтр только по swimmer_id)
CREATE INDEX IF NOT EXISTS "idx_result_swimmer_date" ON "result"("swimmer_id", "date");

-- Результаты серии (частичный: одиночные result с NULL не индексируем)
CREATE INDEX IF NOT EXISTS "idx_result_series_id" ON "result"("series_id") WHERE "series_id" IS NOT NULL;

-- Лента / диапазон дат без фильтра по пловцу
CREATE INDEX IF NOT EXISTS "idx_result_date" ON "result"("date");
