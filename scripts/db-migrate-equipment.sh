#!/usr/bin/env bash
# Добавляет колонки оборудования в result, если их ещё нет.
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

echo "done: $DB"
sqlite3 "$DB" "PRAGMA table_info(result);" | grep -E 'swimfin|finger_paddle|hand_paddle|pull_buoy|board|break_belt|snorkel|wetsuit|monofin'
