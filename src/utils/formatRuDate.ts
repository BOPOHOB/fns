import type { Dayjs } from 'dayjs';

/** Родительный падеж: 14 августа 2026 */
const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
] as const;

function formatRuDate(date: Dayjs): string {
  return `${date.date()} ${MONTHS_GENITIVE[date.month()]} ${date.year()}`;
}

export { formatRuDate, MONTHS_GENITIVE };
