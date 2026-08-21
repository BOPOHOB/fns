import type { PublicSwimmer } from '../types/swimmer.ts';
import type { Team } from '../types/team.ts';
import type { Result, ResultCondition, WaterType } from '../types/result.ts';
import type { ResultSeries } from '../types/resultSeries.ts';

export type SwimmerRow = {
  id: number;
  name: string;
  birth_date: string | null;
  sex: 'male' | 'female';
  role: 'user' | 'trainer';
  notes: string;
};

export type TeamRow = {
  id: number;
  name: string;
  slots: string;
  trainer_id: number | null;
  notes: string;
};

export type ResultRow = {
  id: number;
  swimmer_id: number;
  result: number;
  distance: number;
  date: string;
  type: string;
  stages: string;
  notes: string;
  series_id: number | null;
  water: string;
  swimfin: number;
  hand_paddle: number;
  pull_buoy: number;
  board: number;
  wetsuit: number;
};

export type SeriesRow = {
  id: number;
  date: string;
  regime: number | null;
  speed: number | null;
  repetitions: number;
};

export function mapSwimmer(row: SwimmerRow, teamId: number[]): PublicSwimmer {
  const swimmer: PublicSwimmer = {
    id: row.id,
    teamId,
    name: row.name,
    sex: row.sex,
    role: row.role,
    notes: row.notes,
  };
  const birthDate = row.birth_date?.slice(0, 10);
  if (birthDate) swimmer.birthDate = birthDate;
  return swimmer;
}

export function mapTeam(row: TeamRow): Team {
  let slots: string[] = [];
  try {
    const parsed = JSON.parse(row.slots);
    if (Array.isArray(parsed)) slots = parsed.map(String);
  } catch {
    slots = [];
  }
  return {
    id: row.id,
    name: row.name,
    slots,
    trainerId: row.trainer_id,
    notes: row.notes,
  };
}

export function mapResult(row: ResultRow): Result {
  let stages: Result['stages'] = [];
  try {
    const parsed = JSON.parse(row.stages);
    if (Array.isArray(parsed)) stages = parsed;
  } catch {
    stages = [];
  }

  const result: Result = {
    id: row.id,
    swimmerId: row.swimmer_id,
    result: row.result,
    distance: row.distance,
    date: row.date,
    type: row.type as ResultCondition,
    water: row.water as WaterType,
    stages,
    notes: row.notes,
    swimfin: row.swimfin !== 0,
    handPaddle: row.hand_paddle !== 0,
    pullBuoy: row.pull_buoy !== 0,
    board: row.board !== 0,
    wetsuit: row.wetsuit !== 0,
  };
  if (row.series_id != null) result.seriesId = row.series_id;
  return result;
}

export function mapSeries(row: SeriesRow): ResultSeries {
  return {
    id: row.id,
    date: row.date,
    regime: row.regime,
    speed: row.speed,
    repetitions: row.repetitions,
  };
}
