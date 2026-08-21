import { Hono } from 'hono';
import type { Db } from '../db.ts';
import type { AuthConfig } from '../auth/config.ts';
import { resolveNonSwimmerUser } from '../auth/session.ts';
import { mapResult, mapSeries, type ResultRow, type SeriesRow } from '../mappers.ts';
import type { Result, ResultCondition, Stages, WaterType } from '../../types/result.ts';
import type { ResultSeries } from '../../types/resultSeries.ts';
import { ALLOWED_DISTANCES } from "@shared/distances.ts";

const RESULT_COLUMNS = `
  id, swimmer_id, result, distance, date, type, stages, notes, series_id, water,
  swimfin, hand_paddle, pull_buoy, board, wetsuit
`;

const ALLOWED_TYPES = new Set<ResultCondition>(['competition', 'test', 'workout']);
const ALLOWED_WATER = new Set<WaterType>(['quarter', 'fifty', 'open']);

function parseBoolean(value: unknown, field: string): boolean | string {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'boolean') return `Invalid ${field}`;
  return value;
}

function parseEquipment(raw: Record<string, unknown>): Pick<Result, 'swimfin' | 'handPaddle' | 'pullBuoy' | 'board' | 'wetsuit'> | string {
  const swimfin = parseBoolean(raw.swimfin, 'swimfin');
  if (typeof swimfin === 'string') return swimfin;
  const handPaddle = parseBoolean(raw.handPaddle, 'handPaddle');
  if (typeof handPaddle === 'string') return handPaddle;
  const pullBuoy = parseBoolean(raw.pullBuoy, 'pullBuoy');
  if (typeof pullBuoy === 'string') return pullBuoy;
  const board = parseBoolean(raw.board, 'board');
  if (typeof board === 'string') return board;
  const wetsuit = parseBoolean(raw.wetsuit, 'wetsuit');
  if (typeof wetsuit === 'string') return wetsuit;
  return { swimfin, handPaddle, pullBuoy, board, wetsuit };
}

/** Тело POST /api/series — как на фронте в submitResult при repeat > 1. */
type CreateSeriesBody = Omit<Result, 'id' | 'result' | 'stages' | 'seriesId'> & {
  speed: number | null;
  interval: number | null;
  result: number[];
  stages: Stages[];
};

function parseNullableNumber(value: unknown, field: string): number | null | string {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return `Invalid ${field}`;
  return n;
}

function parseStages(value: unknown): Stages | string {
  if (!Array.isArray(value)) return 'Invalid stages';
  const stages: Stages = [];
  for (const stage of value) {
    if (typeof stage !== 'object' || stage === null) return 'Invalid stages';
    const stageResult = Number((stage as { result?: unknown }).result);
    const stageDistance = Number((stage as { distance?: unknown }).distance);
    if (!Number.isFinite(stageResult) || stageResult <= 0) return 'Invalid stages';
    if (!Number.isInteger(stageDistance) || stageDistance <= 0) return 'Invalid stages';
    stages.push({ result: stageResult, distance: stageDistance });
  }
  return stages;
}

function parseCreateSeriesBody(body: unknown): CreateSeriesBody | string {
  if (typeof body !== 'object' || body === null) {
    return 'Invalid JSON body';
  }

  const raw = body as Record<string, unknown>;

  const swimmerId = Number(raw.swimmerId);
  if (!Number.isInteger(swimmerId) || swimmerId < 1) {
    return 'Invalid swimmerId';
  }

  const distance = Number(raw.distance);
  if (!Number.isInteger(distance) || !ALLOWED_DISTANCES.has(distance)) {
    return 'Invalid distance';
  }

  if (typeof raw.date !== 'string' || !raw.date.trim()) {
    return 'Invalid date';
  }

  if (typeof raw.type !== 'string' || !ALLOWED_TYPES.has(raw.type as ResultCondition)) {
    return 'Invalid type';
  }

  if (typeof raw.water !== 'string' || !ALLOWED_WATER.has(raw.water as WaterType)) {
    return 'Invalid water';
  }

  if (typeof raw.notes !== 'string') {
    return 'Invalid notes';
  }

  const speed = parseNullableNumber(raw.speed, 'speed');
  if (typeof speed === 'string') return speed;

  const interval = parseNullableNumber(raw.interval, 'interval');
  if (typeof interval === 'string') return interval;

  if (!Array.isArray(raw.result) || raw.result.length < 2) {
    return 'Invalid result';
  }

  const times: number[] = [];
  for (const item of raw.result) {
    const t = Number(item);
    if (!Number.isFinite(t) || t <= 0) return 'Invalid result';
    times.push(t);
  }

  if (!Array.isArray(raw.stages) || raw.stages.length !== times.length) {
    return 'Invalid stages';
  }

  const stagesList: Stages[] = [];
  for (const entry of raw.stages) {
    const stages = parseStages(entry);
    if (typeof stages === 'string') return stages;
    stagesList.push(stages);
  }

  const equipment = parseEquipment(raw);
  if (typeof equipment === 'string') return equipment;

  return {
    swimmerId,
    distance,
    date: raw.date.trim(),
    type: raw.type as ResultCondition,
    water: raw.water as WaterType,
    notes: raw.notes,
    speed,
    interval,
    result: times,
    stages: stagesList,
    ...equipment,
  };
}

/** Дата с точностью до дня с фронта; секунды суток задают порядок повторений. */
function resultDateAtIndex(baseIso: string, index: number): string {
  const base = new Date(baseIso);
  if (Number.isNaN(base.getTime())) {
    throw new Error('Invalid date');
  }
  base.setUTCSeconds(base.getUTCSeconds() + index);
  return base.toISOString();
}

export function seriesRoutes(db: Db, authConfig: AuthConfig | null) {
  const app = new Hono();

  app.get('/', (c) => {
    const rows = db
      .prepare(
        `SELECT id, date, regime, speed, repetitions
         FROM result_series
         ORDER BY date DESC`,
      )
      .all() as SeriesRow[];
    return c.json(rows.map(mapSeries));
  });

  app.post('/', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = parseCreateSeriesBody(body);
    if (typeof parsed === 'string') {
      return c.json({ error: parsed }, 400);
    }

    const swimmer = db
      .prepare(`SELECT id FROM swimmer WHERE id = ?`)
      .get(parsed.swimmerId) as { id: number } | undefined;
    if (!swimmer) {
      return c.json({ error: 'Swimmer not found' }, 404);
    }

    const insertResult = db.prepare(`
      INSERT INTO result (
        swimmer_id, result, distance, date, type, stages, notes, series_id, water,
        swimfin, hand_paddle, pull_buoy, board, wetsuit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?)
    `);
    const insertSeries = db.prepare(`
      INSERT INTO result_series (date, regime, speed, repetitions)
      VALUES (?, ?, ?, ?)
    `);
    const linkSeries = db.prepare(`
      UPDATE result SET series_id = ? WHERE id = ?
    `);

    try {
      db.exec('BEGIN');

      const resultIds: number[] = [];
      for (let i = 0; i < parsed.result.length; i++) {
        const date = resultDateAtIndex(parsed.date, i);
        const info = insertResult.run(
          parsed.swimmerId,
          parsed.result[i],
          parsed.distance,
          date,
          parsed.type,
          JSON.stringify(parsed.stages[i]),
          parsed.notes,
          parsed.water,
          parsed.swimfin ? 1 : 0,
          parsed.handPaddle ? 1 : 0,
          parsed.pullBuoy ? 1 : 0,
          parsed.board ? 1 : 0,
          parsed.wetsuit ? 1 : 0,
        );
        resultIds.push(Number(info.lastInsertRowid));
      }

      const seriesInfo = insertSeries.run(
        parsed.date,
        parsed.interval,
        parsed.speed,
        parsed.result.length,
      );
      const seriesId = Number(seriesInfo.lastInsertRowid);

      for (const id of resultIds) {
        linkSeries.run(seriesId, id);
      }

      db.exec('COMMIT');

      const resultRows = resultIds.map((id) =>
        db.prepare(`SELECT ${RESULT_COLUMNS} FROM result WHERE id = ?`).get(id) as ResultRow
      );
      const seriesRow = db
        .prepare(
          `SELECT id, date, regime, speed, repetitions FROM result_series WHERE id = ?`,
        )
        .get(seriesId) as SeriesRow;

      const response: { results: Result[]; series: ResultSeries } = {
        results: resultRows.map(mapResult),
        series: mapSeries(seriesRow),
      };
      return c.json(response, 201);
    } catch (e) {
      try {
        db.exec('ROLLBACK');
      } catch {
        // ignore
      }
      return c.json({ error: e instanceof Error ? e.message : 'Insert failed' }, 500);
    }
  });

  app.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid id' }, 400);

    const row = db
      .prepare(
        `SELECT id, date, regime, speed, repetitions
         FROM result_series WHERE id = ?`,
      )
      .get(id) as SeriesRow | undefined;
    if (!row) return c.json({ error: 'Not found' }, 404);
    return c.json(mapSeries(row));
  });

  return app;
}
