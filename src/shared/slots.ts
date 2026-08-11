/** Слот: 'ddd hh:mm-hh:mm', например 'mon 19:45-21:15' */

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const DAY_LABELS: Record<string, string> = {
  mon: 'пн',
  tue: 'вт',
  wed: 'ср',
  thu: 'чт',
  fri: 'пт',
  sat: 'сб',
  sun: 'вс',
};

function slotEmoji(startHour: number): string {
  if (startHour <= 10) return '🌅';
  if (startHour >= 18) return '🌇';
  return '☀️';
}

const SLOT_RE = /^([a-z]{3})\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/i;

function slotSortKey(slot: string): number {
  const match = slot.trim().match(SLOT_RE);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const dayIndex = DAY_ORDER.indexOf(match[1].toLowerCase() as (typeof DAY_ORDER)[number]);
  const day = dayIndex === -1 ? 7 : dayIndex;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return day * 24 * 60 + minutes;
}

/** Пн → вс, в пределах дня — по времени начала. */
function sortSlots(slots: string[]): string[] {
  return [...slots].sort((a, b) => slotSortKey(a) - slotSortKey(b));
}

/** Перевод слота на русский с эмодзи по времени начала. */
function formatSlot(slot: string): string {
  const match = slot.trim().match(SLOT_RE);
  if (!match) return slot;

  const [, day, hh, mm, hh2, mm2] = match;
  const dayRu = DAY_LABELS[day.toLowerCase()] ?? day;
  const startHour = Number(hh);
  const emoji = slotEmoji(startHour);
  const start = `${String(startHour).padStart(2, '0')}:${mm}`;
  const end = `${String(Number(hh2)).padStart(2, '0')}:${mm2}`;
  return `${emoji} ${dayRu} ${start}–${end}`;
}

function formatSlots(slots: string[]): string[] {
  return slots.map(formatSlot);
}

export { formatSlot, formatSlots, sortSlots, DAY_LABELS, DAY_ORDER };
