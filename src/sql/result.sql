CREATE TABLE IF NOT EXISTS "result" (
  "id" INTEGER NOT NULL UNIQUE,
  "swimmer_id" INTEGER NOT NULL,
  "result" INTEGER NOT NULL,
  "distance" INTEGER NOT NULL CHECK ("distance" IN (
    25, 50, 75, 100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500,
    2000, 3000, 5000, 10000, 1852, 3704
  )),
  "date" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('competition', 'test', 'workout')),
  "stages" TEXT NOT NULL DEFAULT '[]',
  "notes" TEXT NOT NULL DEFAULT '',
  "series_id" INTEGER,
  "water" TEXT NOT NULL CHECK ("water" IN ('quarter', 'fifty', 'open')),
  "stroke" TEXT DEFAULT NULL CHECK ("stroke" IS NULL OR "stroke" IN (
    'butterfly', 'backstroke', 'breaststroke', 'freestyle', 'medley'
  )),
  "swimfin" INTEGER NOT NULL DEFAULT 0 CHECK ("swimfin" IN (0, 1)),
  "finger_paddle" INTEGER NOT NULL DEFAULT 0 CHECK ("finger_paddle" IN (0, 1)),
  "hand_paddle" INTEGER NOT NULL DEFAULT 0 CHECK ("hand_paddle" IN (0, 1)),
  "pull_buoy" INTEGER NOT NULL DEFAULT 0 CHECK ("pull_buoy" IN (0, 1)),
  "board" INTEGER NOT NULL DEFAULT 0 CHECK ("board" IN (0, 1)),
  "break_belt" INTEGER NOT NULL DEFAULT 0 CHECK ("break_belt" IN (0, 1)),
  "snorkel" INTEGER NOT NULL DEFAULT 0 CHECK ("snorkel" IN (0, 1)),
  "wetsuit" INTEGER NOT NULL DEFAULT 0 CHECK ("wetsuit" IN (0, 1)),
  "monofin" INTEGER NOT NULL DEFAULT 0 CHECK ("monofin" IN (0, 1)),
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
