#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ICON_SRC:-$HOME/.cursor/projects/Users-bopohob-q-feelAndSwim/assets}"
OUT="$ROOT/src/pages/addResult/icons/traced"
TMP="${TMPDIR:-/tmp}/feelandswim-trace"

THRESHOLD="${TRACE_THRESHOLD:-0.45}"
SCALE="${TRACE_SCALE:-2}"

mkdir -p "$OUT" "$TMP"

trace_one() {
  local name="$1"
  local png="$2"
  local bmp="$TMP/$name.bmp"
  local pbm="$TMP/$name.pbm"
  local trimmed="$TMP/$name-trim.pbm"
  local svg="$OUT/$name.svg"

  if [[ ! -f "$png" ]]; then
    echo "skip $name: missing $png" >&2
    return 1
  fi

  echo "trace $name <- $(basename "$png")"
  sips -s format bmp "$png" --out "$bmp" >/dev/null
  mkbitmap -t "$THRESHOLD" -s "$SCALE" "$bmp" -o "$pbm"
  python3 "$ROOT/scripts/trim-pbm.py" "$pbm" "$trimmed"
  potrace "$trimmed" -s -o "$svg" --flat -O 0.2

  sed -i '' \
    -e 's/fill="#000000"/fill="currentColor"/g' \
    -e 's/ width="[^"]*"//g' \
    -e 's/ height="[^"]*"//g' \
    "$svg"
}

trace_one swimfin "$SRC/swimfin-icon.png"
trace_one fingerPaddle "$SRC/fingerPaddle-icon.png"
trace_one handPaddle "$SRC/handPaddle-icon.png"
trace_one pullBuoy "$SRC/pullBuoy-icon.png"
trace_one board "$SRC/board-icon.png"
trace_one wetsuit "$SRC/wetsuit-icon.png"
trace_one breakBelt "$SRC/breakBelt-icon-v2.png"
trace_one snorkel "$SRC/snorkel-icon.png"
trace_one monofin "$SRC/monofin-icon.png"

echo "done -> $OUT"
ls -la "$OUT"
