CREATE TABLE IF NOT EXISTS "swimmer" (
  "id" INTEGER NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "birth_date" TEXT,
  "sex" TEXT NOT NULL CHECK ("sex" IN ('male', 'female')),
  "role" TEXT NOT NULL DEFAULT 'user' CHECK ("role" IN ('user', 'trainer')),
  "yandex_login" TEXT,
  "notes" TEXT NOT NULL DEFAULT '',
  "private_notes" TEXT NOT NULL DEFAULT '',
  PRIMARY KEY ("id" AUTOINCREMENT)
);

-- Один логин Яндекса — один пловец (NULL допускается много раз)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_swimmer_yandex_login"
  ON "swimmer"("yandex_login")
  WHERE "yandex_login" IS NOT NULL;
