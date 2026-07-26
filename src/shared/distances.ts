import type { DistanceName } from '../types/result.ts';

/** Метры для каждой DistanceName (1ml/2ml — морские мили). */
export const DISTANCE_METERS = {
  '25m': 25,
  '50m': 50,
  '100m': 100,
  '200m': 200,
  '400m': 400,
  '500m': 500,
  '800m': 800,
  '1000m': 1000,
  '1500m': 1500,
  '2k': 2000,
  '3k': 3000,
  '5k': 5000,
  '10k': 10000,
  '1ml': 1852,
  '2ml': 3704,
} as const satisfies Record<DistanceName, number>;

export const DISTANCE_NAMES = Object.keys(DISTANCE_METERS) as DistanceName[];

const METERS_TO_NAME = new Map<number, DistanceName>(
  Object.entries(DISTANCE_METERS).map(([name, meters]) => [meters, name as DistanceName]),
);

export function distanceToMeters(name: DistanceName): number {
  return DISTANCE_METERS[name];
}

export function metersToDistance(meters: number): DistanceName | null {
  return METERS_TO_NAME.get(meters) ?? null;
}

export function isDistanceName(value: string): value is DistanceName {
  return value in DISTANCE_METERS;
}
