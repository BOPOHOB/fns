import {
  distanceName,
  formatRuDateValue,
  stringifySeconds,
} from "../../shared/format.ts";
import { buildStagesRows } from "../../shared/stagesLayout.ts";

const W = 1200;
const H = 630;

const COLORS = {
  bg: "#0B1F2A",
  panel: "#123040",
  accent: "#D8E6F3",
  cell: "#1A4558",
  cellText: "#E8F4FC",
  title: "#FFFFFF",
  muted: "#9CB3C2",
  gap: "#0B1F2A",
};

type OgResultInput = {
  swimmerName: string;
  distance: number;
  result: number;
  date: string;
  stages: Array<{ result: number; distance: number }> | null;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderStagesSvg(
  stages: OgResultInput["stages"],
  distance: number,
  result: number,
): string {
  const list = stages ?? [];
  if (!list.length) return "";

  const rows = buildStagesRows(list, distance, result);
  const cellW = 88 * 1.25;
  const cellH = 36 * 1.25;
  const gap = 2;
  const startY = 360;
  const maxWidth = W - 96;

  let y = startY;
  const parts: string[] = [];

  for (const row of rows) {
    let x = 48;
    let rowWidth = 0;
    for (const cell of row.cells) {
      rowWidth += cell.span * cellW + (cell.span - 1) * gap + gap;
    }
    const scale = rowWidth > maxWidth ? maxWidth / rowWidth : 1;
    const cw = cellW * scale;
    const g = gap * scale;
    const fontSize = Math.max(14, Math.round(24 * Math.min(scale, 1)));

    for (const cell of row.cells) {
      const w = cw * cell.span + g * (cell.span - 1);
      parts.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${cellH}" rx="3" fill="${COLORS.cell}"/>`,
        `<text x="${x + w / 2}" y="${y + cellH * 0.68}" text-anchor="middle" fill="${COLORS.cellText}" font-size="${fontSize}" font-family="Noto Sans">${escapeXml(cell.distanceLabel)}</text>`,
        `<rect x="${x}" y="${y + cellH + g}" width="${w}" height="${cellH}" rx="3" fill="${COLORS.cell}"/>`,
        `<text x="${x + w / 2}" y="${y + cellH + g + cellH * 0.68}" text-anchor="middle" fill="${COLORS.accent}" font-size="${fontSize}" font-family="Noto Sans">${escapeXml(cell.paceLabel)}</text>`,
      );
      x += w + g;
    }
    y += cellH * 2 + g + 10;
  }

  return parts.join("\n");
}

function buildResultOgSvg(input: OgResultInput): string {
  const distLabel = escapeXml(distanceName(input.distance, true));
  const timeLabel = escapeXml(stringifySeconds(input.result));
  const name = escapeXml(input.swimmerName);
  const date = escapeXml(formatRuDateValue(input.date));
  const stages = renderStagesSvg(input.stages, input.distance, input.result);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
  <rect x="32" y="32" width="${W - 64}" height="${H - 64}" rx="24" fill="${COLORS.panel}"/>
  <text x="${W - 56}" y="88" text-anchor="end" fill="${COLORS.title}" font-size="36" font-weight="700" font-family="Noto Sans">${name}</text>
  <text x="${W - 56}" y="132" text-anchor="end" fill="${COLORS.muted}" font-size="26" font-family="Noto Sans">${date}</text>
  <text x="64" y="160" fill="${COLORS.muted}" font-size="42" font-family="Noto Sans">${distLabel}</text>
  <text x="64" y="280" fill="${COLORS.title}" font-size="120" font-weight="700" font-family="Noto Sans">${timeLabel}</text>
  ${stages}
</svg>`;
}

export { buildResultOgSvg, W as OG_WIDTH, H as OG_HEIGHT, type OgResultInput };
