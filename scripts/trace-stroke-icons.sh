#!/usr/bin/env bash
# Trace stroke (swim style) outline PNGs -> SVG
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ICON_SRC:-$HOME/.cursor/projects/Users-bopohob-q-feelAndSwim/assets}"
OUT="$ROOT/src/pages/addResult/stroke/icons"
TMP="${TMPDIR:-/tmp}/feelandswim-trace-stroke"

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

trace_one butterfly "$SRC/butterfly-icon.png"
trace_one backstroke "$SRC/backstroke-icon.png"
trace_one breaststroke "$SRC/breaststroke-icon.png"
trace_one freestyle "$SRC/freestyle-icon.png"
trace_one medley "$SRC/medley-icon.png"

echo "done -> $OUT"
ls -la "$OUT"
