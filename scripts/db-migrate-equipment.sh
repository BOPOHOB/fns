#!/usr/bin/env bash
# Добавляет колонки оборудования и stroke в result, если их ещё нет.
# SQLite не поддерживает ADD COLUMN IF NOT EXISTS — дубликаты игнорируем.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="${1:-$ROOT/data.db}"

if [[ ! -f "$DB" ]]; then
  echo "DB not found: $DB" >&2
  exit 1
fi

COLUMNS=(
  "swimfin"
  "finger_paddle"
  "hand_paddle"
  "pull_buoy"
  "board"
  "break_belt"
  "snorkel"
  "wetsuit"
  "monofin"
)

for col in "${COLUMNS[@]}"; do
  if sqlite3 "$DB" "ALTER TABLE result ADD COLUMN ${col} INTEGER NOT NULL DEFAULT 0 CHECK (${col} IN (0, 1));" 2>/dev/null; then
    echo "added ${col}"
  else
    echo "skip ${col} (already exists or error)"
  fi
done

STROKE_CHECK="stroke IS NULL OR stroke IN ('butterfly', 'backstroke', 'breaststroke', 'freestyle', 'medley')"

# stroke уже есть (в т.ч. NOT NULL) → пересоздаём колонку как nullable
if sqlite3 "$DB" "PRAGMA table_info(result);" | grep -q '|stroke|'; then
  echo "rebuilding stroke as nullable..."
  sqlite3 "$DB" <<SQL
BEGIN;
CREATE TABLE IF NOT EXISTS result_stroke_bak AS SELECT id, stroke FROM result;
ALTER TABLE result DROP COLUMN stroke;
ALTER TABLE result ADD COLUMN stroke TEXT DEFAULT NULL CHECK (${STROKE_CHECK});
UPDATE result SET stroke = (SELECT stroke FROM result_stroke_bak WHERE result_stroke_bak.id = result.id);
DROP TABLE result_stroke_bak;
COMMIT;
SQL
  echo "stroke is nullable"
else
  if sqlite3 "$DB" "ALTER TABLE result ADD COLUMN stroke TEXT DEFAULT NULL CHECK (${STROKE_CHECK});" 2>/dev/null; then
    echo "added stroke (nullable)"
  else
    echo "skip stroke (error)"
  fi
fi

echo "done: $DB"
sqlite3 "$DB" "PRAGMA table_info(result);" | grep -E 'swimfin|finger_paddle|hand_paddle|pull_buoy|board|break_belt|snorkel|wetsuit|monofin|stroke'
