import { plural } from "./plural.ts";

const MILE = 1852;

const FORMATTER = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
  minimumIntegerDigits: 2,
  useGrouping: false,
});

const lz = FORMATTER.format;

function stringifySeconds(v: number | null): string {
  if (v === null) {
    return "";
  }
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const s = v % 60;
  if (h) {
    return [h, lz(m), lz(s)].join(":");
  }
  if (m) {
    return [m, lz(s)].join(":");
  }
  if (s) {
    return lz(s);
  }
  return "";
}

function distanceName(distance: number, short = false): string {
  if (distance < 1000) {
    return `${distance}${short ? "м" : plural(distance, [" метр", " метров", " метра"])}`;
  }
  if (distance === 1000) {
    return short ? "1км" : "Километр";
  }
  if (distance === 1200) {
    return short ? "1200м" : "1200 метров";
  }
  const miles = distance / MILE;
  if (miles === Math.floor(miles)) {
    return miles === 1
      ? "Миля"
      : `${miles} ${plural(miles, ["миля", "миль", "мили"])}`;
  }
  const km = distance / 1000;
  return `${km}${short ? "км" : plural(km, [" километр", " километров", " километра"])}`;
}

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

/** `date` — Date или ISO-строка. */
function formatRuDateValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]} ${d.getFullYear()}`;
}

export {
  stringifySeconds,
  distanceName,
  formatRuDateValue,
  MONTHS_GENITIVE,
};
