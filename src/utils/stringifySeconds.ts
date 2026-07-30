const FORMATTER = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2, minimumIntegerDigits: 2, useGrouping: false, });

const lz = FORMATTER.format;

const stringifySeconds = (v: number | null): string => {
  if (v === null) {
    return '';
  }
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const s = v % 60;
  if (h) {
    return [h, lz(m), lz(s)].join(':');
  }
  if (m) {
    return [m, lz(s)].join(':');
  }
  if (s) {
    return lz(s);
  }
  return '';
}

export { stringifySeconds };
