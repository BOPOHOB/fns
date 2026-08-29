import { dirname, fromFileUrl, join } from "jsr:@std/path";
import type { Stroke } from "../../types/result.ts";

const TRACE_STROKE_WIDTH = 200;

const STROKE_FILES: Record<Stroke, string> = {
  butterfly: "butterfly.svg",
  backstroke: "backstroke.svg",
  breaststroke: "breaststroke.svg",
  freestyle: "freestyle.svg",
  medley: "medley.svg",
};

type PreparedStroke = { viewBox: string; inner: string };

const cache = new Map<Stroke, PreparedStroke>();

function iconsDir(): string {
  const here = dirname(fromFileUrl(import.meta.url));
  return join(here, "../../components/stroke/icons");
}

function prepareStroke(raw: string): PreparedStroke {
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";
  const inner = (raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)?.[1]?.trim() ?? "")
    .replace(/fill="#000000"/g, 'fill="currentColor"')
    .replace(
      /<g transform="([^"]+)"\s*\nfill="currentColor"\s*stroke="none">/,
      `<g transform="$1"\nfill="currentColor" stroke="currentColor" stroke-width="${TRACE_STROKE_WIDTH}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill">`,
    );
  return { viewBox, inner };
}

function loadStroke(stroke: Stroke): PreparedStroke {
  const hit = cache.get(stroke);
  if (hit) return hit;
  const raw = Deno.readTextFileSync(join(iconsDir(), STROKE_FILES[stroke]));
  const prepared = prepareStroke(raw);
  cache.set(stroke, prepared);
  return prepared;
}

/** Иконка стиля для OG (вложенный SVG с currentColor). */
function strokeIconSvg(
  stroke: Stroke,
  x: number,
  y: number,
  size: number,
  color: string,
): string {
  const { viewBox, inner } = loadStroke(stroke);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}" fill="${color}" color="${color}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

export { strokeIconSvg };
