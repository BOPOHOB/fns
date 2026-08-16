import type { Dayjs } from 'dayjs';
import { formatRuDateValue, MONTHS_GENITIVE } from '../shared/format';

/** Родительный падеж: 14 августа 2026 */
function formatRuDate(date: Dayjs): string {
  return formatRuDateValue(date.toDate());
}

export { formatRuDate, MONTHS_GENITIVE };
