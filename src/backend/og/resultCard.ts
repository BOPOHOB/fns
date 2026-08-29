import {
  distanceName,
  formatRuDateValue,
  stringifySeconds,
} from "../../shared/format.ts";
import { buildStagesRows } from "../../shared/stagesLayout.ts";
import type { Stroke } from "../../types/result.ts";
import { logoMarkGroup } from "./logoMark.ts";
import { strokeIconSvg } from "./strokeIcon.ts";

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
  brand: "#209FAF",
  gap: "#0B1F2A",
};

type OgRep = {
  result: number;
  distance: number;
  stages: Array<{ result: number; distance: number }> | null;
};

type OgResultInput = {
  swimmerName: string;
  distance: number;
  /** Секунды: одиночный результат или среднее по серии. */
  result: number;
  date: string;
  stages: Array<{ result: number; distance: number }> | null;
  stroke: Stroke | null;
  series?: {
    repetitions: number;
    regime: number | null;
    speed: number | null;
    reps: OgRep[];
  };
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderStroke(stroke: Stroke | null): string {
  if (!stroke) return "";
  return strokeIconSvg(stroke, 56, 48, 120, COLORS.accent);
}

function pacePer100(result: number, distance: number): number {
  if (!distance) return 0;
  return (result / distance) * 100;
}

/** Левый край artwork в координатах logo.svg (viewBox начинается с 200). */
const LOGO_ART_LEFT = 310;
const LOGO_VIEWBOX_LEFT = 200;
const LOGO_VIEWBOX_WIDTH = 2000;
const NAME_FONT_SIZE = 36;
const NAME_RIGHT_X = W - 56;

/** Грубая ширина Noto Sans Bold для выравнивания логотипа под именем. */
function approxTextWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    units += ch === " " ? 0.33 : 0.62;
  }
  return units * fontSize;
}

function renderBrand(swimmerName: string): string {
  const markW = 440;
  const markH = markW * (1000 / LOGO_VIEWBOX_WIDTH);
  const scale = markW / LOGO_VIEWBOX_WIDTH;
  const leftInset = (LOGO_ART_LEFT - LOGO_VIEWBOX_LEFT) * scale;
  // Right-aligned имя заканчивается слева в nameLeft — с ним совпадает начало полигонов.
  const nameLeft = NAME_RIGHT_X - approxTextWidth(swimmerName, NAME_FONT_SIZE);
  let groupX = nameLeft - leftInset;
  const maxX = W - 32 - markW;
  if (groupX > maxX) groupX = maxX;
  return logoMarkGroup(groupX, (H - markH) / 2, markW);
}

function renderStagesSvg(
  stages: OgResultInput["stages"],
  distance: number,
  result: number,
  startY: number,
): string {
  const list = stages ?? [];
  if (!list.length) return "";

  const rows = buildStagesRows(list, distance, result);
  const cellW = 88 * 1.25;
  const cellH = 36 * 1.25;
  const gap = 2;
  const maxWidth = W - 96;
  const maxY = H - 48;

  let y = startY;
  const parts: string[] = [];

  for (const row of rows) {
    if (y + cellH * 2 > maxY) break;
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

/** Сетка повторов серии: время + темп на 100 м. */
function renderSeriesReps(reps: OgRep[], startY: number): string {
  const n = reps.length;
  if (!n) return "";

  const padX = 48;
  const gap = 10;
  const maxWidth = W - padX * 2;
  const cols = Math.min(n, n <= 6 ? n : Math.ceil(Math.sqrt(n)));
  const cellW = (maxWidth - gap * (cols - 1)) / cols;
  const cellH = 88;
  const maxY = H - 48;
  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padX + col * (cellW + gap);
    const y = startY + row * (cellH + gap);
    if (y + cellH > maxY) break;

    const rep = reps[i]!;
    const time = escapeXml(stringifySeconds(rep.result));
    const pace = escapeXml(stringifySeconds(pacePer100(rep.result, rep.distance)));
    const idx = escapeXml(String(i + 1));

    parts.push(
      `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="10" fill="${COLORS.cell}"/>`,
      `<text x="${x + 16}" y="${y + 28}" fill="${COLORS.muted}" font-size="20" font-family="Noto Sans">#${idx}</text>`,
      `<text x="${x + 16}" y="${y + 58}" fill="${COLORS.title}" font-size="32" font-weight="700" font-family="Noto Sans">${time}</text>`,
      `<text x="${x + 16}" y="${y + 78}" fill="${COLORS.accent}" font-size="29" font-family="Noto Sans">темп ${pace}</text>`,
    );
  }

  return parts.join("\n");
}

function buildResultOgSvg(input: OgResultInput): string {
  const name = escapeXml(input.swimmerName);
  const date = escapeXml(formatRuDateValue(input.date));
  const timeLabel = escapeXml(stringifySeconds(input.result));
  const paceLabel = escapeXml(
    stringifySeconds(pacePer100(input.result, input.distance)),
  );
  const series = input.series;
  const isSeries = Boolean(series && series.reps.length > 1);

  const distLabel = isSeries
    ? escapeXml(
      `${series!.reps.length}×${distanceName(input.distance, true)}`,
    )
    : escapeXml(distanceName(input.distance, true));

  const paceCaption = "на 100м";
  const timeCaption = isSeries ? "среднее" : "";

  let body = "";
  if (isSeries) {
    body = `
  <text x="64" y="200" fill="${COLORS.muted}" font-size="36" font-family="Noto Sans">${distLabel}</text>
  <text x="64" y="290" fill="${COLORS.title}" font-size="84" font-weight="700" font-family="Noto Sans">${timeLabel}</text>
  <text x="64" y="330" fill="${COLORS.muted}" font-size="48" font-family="Noto Sans">${escapeXml(timeCaption)} · ${paceLabel} ${paceCaption}</text>
  ${renderSeriesReps(series!.reps, 360)}`;
  } else {
    const hasStages = (input.stages?.length ?? 0) > 0;
    if (hasStages) {
      body = `
  <text x="64" y="200" fill="${COLORS.muted}" font-size="42" font-family="Noto Sans">${distLabel}</text>
  <text x="64" y="310" fill="${COLORS.title}" font-size="110" font-weight="700" font-family="Noto Sans">${timeLabel}</text>
  <text x="64" y="370" fill="${COLORS.accent}" font-size="62" font-family="Noto Sans">${paceLabel} ${paceCaption}</text>
  ${renderStagesSvg(input.stages, input.distance, input.result, 400)}`;
    } else {
      body = `
  <text x="64" y="250" fill="${COLORS.muted}" font-size="72" font-family="Noto Sans">${distLabel}</text>
  <text x="64" y="420" fill="${COLORS.title}" font-size="180" font-weight="700" font-family="Noto Sans">${timeLabel}</text>
  <text x="64" y="559" fill="${COLORS.accent}" font-size="86" font-family="Noto Sans">${paceLabel} ${paceCaption}</text>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
  <rect x="32" y="32" width="${W - 64}" height="${H - 64}" rx="24" fill="${COLORS.panel}"/>
  ${renderBrand(input.swimmerName)}
  ${renderStroke(input.stroke)}
  <text x="${NAME_RIGHT_X}" y="88" text-anchor="end" fill="${COLORS.title}" font-size="${NAME_FONT_SIZE}" font-weight="700" font-family="Noto Sans">${name}</text>
  <text x="${NAME_RIGHT_X}" y="132" text-anchor="end" fill="${COLORS.muted}" font-size="26" font-family="Noto Sans">${date}</text>
  ${body}
</svg>`;
}

export { buildResultOgSvg, W as OG_WIDTH, H as OG_HEIGHT, type OgResultInput };
