import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { DistanceCategory } from '../../shared/distances';

const STORAGE_KEY = 'fas-filters';

type FilterState = {
  bestOnly: boolean;
  distances: DistanceCategory[];
  groups: number[];
  sex: 'all' | 'male' | 'female';
  ageMin: number;
  ageMax: number;
};

const DEFAULT_FILTERS: FilterState = {
  bestOnly: true,
  distances: [],
  groups: [],
  sex: 'all',
  ageMin: 10,
  ageMax: 90,
};

function parseBool(v: string | null, fallback: boolean): boolean {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

function parseList(v: string | null): string[] {
  if (!v) return [];
  return v.split(',').filter(Boolean);
}

function parseNum(v: string | null, fallback: number): number {
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

function parseIds(v: string | null): number[] {
  return parseList(v)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function isDistanceCategory(v: string): v is DistanceCategory {
  return v === '25m' || v === '50m' || v === 'open';
}

function readStorage(): Partial<FilterState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<FilterState>;
  } catch {
    return null;
  }
}

function writeStorage(state: FilterState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function filtersFromUrl(params: URLSearchParams): FilterState {
  return {
    bestOnly: parseBool(params.get('best'), DEFAULT_FILTERS.bestOnly),
    distances: parseList(params.get('dist')).filter(isDistanceCategory),
    groups: parseIds(params.get('group')),
    sex: (params.get('sex') as FilterState['sex']) || DEFAULT_FILTERS.sex,
    ageMin: parseNum(params.get('ageMin'), DEFAULT_FILTERS.ageMin),
    ageMax: parseNum(params.get('ageMax'), DEFAULT_FILTERS.ageMax),
  };
}

function hasFilterParams(params: URLSearchParams) {
  return ['best', 'dist', 'group', 'sex', 'ageMin', 'ageMax'].some((k) => params.has(k));
}

function filtersToParams(state: FilterState): Record<string, string> {
  const p: Record<string, string> = {};
  if (state.bestOnly !== DEFAULT_FILTERS.bestOnly) p.best = String(state.bestOnly);
  if (state.distances.length) p.dist = state.distances.join(',');
  if (state.groups.length) p.group = state.groups.join(',');
  if (state.sex !== 'all') p.sex = state.sex;
  if (state.ageMin !== DEFAULT_FILTERS.ageMin) p.ageMin = String(state.ageMin);
  if (state.ageMax !== DEFAULT_FILTERS.ageMax) p.ageMax = String(state.ageMax);
  return p;
}

function filtersAreDefault(state: FilterState): boolean {
  return (
    state.bestOnly === DEFAULT_FILTERS.bestOnly &&
    !state.distances.length &&
    !state.groups.length &&
    state.sex === DEFAULT_FILTERS.sex &&
    state.ageMin === DEFAULT_FILTERS.ageMin &&
    state.ageMax === DEFAULT_FILTERS.ageMax
  );
}

function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => filtersFromUrl(searchParams), [searchParams]);

  useEffect(() => {
    if (hasFilterParams(searchParams)) return;
    const stored = readStorage();
    if (!stored) return;
    setSearchParams(filtersToParams({ ...DEFAULT_FILTERS, ...stored }), { replace: true });
  }, [searchParams, setSearchParams]);

  const setFilters = useCallback(
    (next: FilterState) => {
      writeStorage(next);
      setSearchParams(filtersToParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    setFilters,
    clearFilters,
    filtersAreDefault: filtersAreDefault(filters),
  };
}

export { useFilters, DEFAULT_FILTERS, type FilterState };
