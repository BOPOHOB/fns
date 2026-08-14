import type { WaterType } from '../types/result';

export type DistanceCategory = '25m' | '50m' | 'open';

export const DISTANCE_CATEGORY_OPTIONS: { value: DistanceCategory; label: string }[] = [
  { value: '25m', label: '25м' },
  { value: '50m', label: '50м' },
  { value: 'open', label: 'Открытая вода' },
];

const POOL_DISTANCES = [25, 50, 100, 200, 300, 400, 500, 800, 1000, 1500];
const OPEN_WATER_DISTANCES = [500, 1000, 2000, 3000, 5000, 10000, 1852, 1852 * 2];
const ALLOWED_DISTANCES = new Set([...POOL_DISTANCES, ...OPEN_WATER_DISTANCES]);

/** Какие колонки дистанций показывать по выбранным типам бассейна. */
function distancesForCategories(
  categories: DistanceCategory[],
  available: number[],
): number[] {
  if (!categories.length) return available;

  let allowed: number[];
  if (categories.length === 1 && categories[0] === 'open') {
    allowed = OPEN_WATER_DISTANCES;
  } else if (!categories.includes('open')) {
    allowed = categories.includes('25m')
      ? POOL_DISTANCES
      : POOL_DISTANCES.filter((d) => d !== 25);
  } else if (!categories.includes('25m')) {
    allowed = [...new Set([...POOL_DISTANCES.filter((d) => d !== 25), ...OPEN_WATER_DISTANCES])];
  } else {
    allowed = [...new Set([...POOL_DISTANCES, ...OPEN_WATER_DISTANCES])];
  }

  const allowedSet = new Set(allowed);
  return available.filter((d) => allowedSet.has(d));
}

/** Фильтр результатов по fifty / типу воды — как в старом distanceFilter. */
function resultMatchesDistanceCategories(
  water: WaterType,
  categories: DistanceCategory[],
): boolean {
  if (!categories.length) return true;
  const fifty = water === 'fifty';
  if (!categories.includes('50m')) return !fifty;
  if (!categories.includes('25m')) return fifty;
  return true;
}

export { distancesForCategories, resultMatchesDistanceCategories, ALLOWED_DISTANCES };
