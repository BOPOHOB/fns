import { Hono } from 'hono';
import type { Db } from '../db.ts';
import type { AuthConfig } from '../auth/config.ts';
import { resolveNonSwimmerUser } from '../auth/session.ts';
import { mapResult, type ResultRow } from '../mappers.ts';
import type { Result, ResultCondition, Stroke, WaterType } from '../../types/result.ts';
import { ALLOWED_DISTANCES } from "@shared/distances.ts";

const RESULT_COLUMNS = `
  id, swimmer_id, result, distance, date, type, stages, notes, series_id, water, stroke,
  swimfin, finger_paddle, hand_paddle, pull_buoy, board, break_belt, snorkel, wetsuit, monofin
`;

const ALLOWED_TYPES = new Set<ResultCondition>(['competition', 'test', 'workout']);
const ALLOWED_WATER = new Set<WaterType>(['quarter', 'fifty', 'open']);
const ALLOWED_STROKES = new Set<Stroke>([
  'butterfly',
  'backstroke',
  'breaststroke',
  'freestyle',
  'medley',
]);

type CreateResultBody = Omit<Result, 'id'>;

function parseBoolean(value: unknown, field: string): boolean | string {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'boolean') return `Invalid ${field}`;
  return value;
}

function parseStroke(value: unknown): Stroke | null | 'Invalid stroke' {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !ALLOWED_STROKES.has(value as Stroke)) {
    return 'Invalid stroke';
  }
  return value as Stroke;
}

type EquipmentFields = Pick<
  Result,
  | 'swimfin'
  | 'fingerPaddle'
  | 'handPaddle'
  | 'pullBuoy'
  | 'board'
  | 'breakBelt'
  | 'snorkel'
  | 'wetsuit'
  | 'monofin'
>;

function parseEquipment(raw: Record<string, unknown>): EquipmentFields | string {
  const swimfin = parseBoolean(raw.swimfin, 'swimfin');
  if (typeof swimfin === 'string') return swimfin;
  const fingerPaddle = parseBoolean(raw.fingerPaddle, 'fingerPaddle');
  if (typeof fingerPaddle === 'string') return fingerPaddle;
  const handPaddle = parseBoolean(raw.handPaddle, 'handPaddle');
  if (typeof handPaddle === 'string') return handPaddle;
  const pullBuoy = parseBoolean(raw.pullBuoy, 'pullBuoy');
  if (typeof pullBuoy === 'string') return pullBuoy;
  const board = parseBoolean(raw.board, 'board');
  if (typeof board === 'string') return board;
  const breakBelt = parseBoolean(raw.breakBelt, 'breakBelt');
  if (typeof breakBelt === 'string') return breakBelt;
  const snorkel = parseBoolean(raw.snorkel, 'snorkel');
  if (typeof snorkel === 'string') return snorkel;
  const wetsuit = parseBoolean(raw.wetsuit, 'wetsuit');
  if (typeof wetsuit === 'string') return wetsuit;
  const monofin = parseBoolean(raw.monofin, 'monofin');
  if (typeof monofin === 'string') return monofin;
  return {
    swimfin,
    fingerPaddle,
    handPaddle,
    pullBuoy,
    board,
    breakBelt,
    snorkel,
    wetsuit,
    monofin,
  };
}

function parseCreateBody(body: unknown): CreateResultBody | string {
  if (typeof body !== 'object' || body === null) {
    return 'Invalid JSON body';
  }

  const raw = body as Record<string, unknown>;

  const swimmerId = Number(raw.swimmerId);
  if (!Number.isInteger(swimmerId) || swimmerId < 1) {
    return 'Invalid swimmerId';
  }

  const result = Number(raw.result);
  if (!Number.isFinite(result) || result <= 0) {
    return 'Invalid result';
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

  const strokeResult = parseStroke(raw.stroke);
  if (strokeResult === 'Invalid stroke') {
    return strokeResult;
  }
  const stroke = strokeResult;

  if (typeof raw.notes !== 'string') {
    return 'Invalid notes';
  }

  if (!Array.isArray(raw.stages)) {
    return 'Invalid stages';
  }

  const stages: Result['stages'] = [];
  for (const stage of raw.stages) {
    if (typeof stage !== 'object' || stage === null) {
      return 'Invalid stages';
    }
    const stageResult = Number((stage as { result?: unknown }).result);
    const stageDistance = Number((stage as { distance?: unknown }).distance);
    if (!Number.isFinite(stageResult) || stageResult <= 0) {
      return 'Invalid stages';
    }
    if (!Number.isInteger(stageDistance) || stageDistance <= 0) {
      return 'Invalid stages';
    }
    stages.push({ result: stageResult, distance: stageDistance });
  }

  let seriesId: number | undefined;
  if (raw.seriesId !== undefined && raw.seriesId !== null) {
    const id = Number(raw.seriesId);
    if (!Number.isInteger(id) || id < 1) {
      return 'Invalid seriesId';
    }
    seriesId = id;
  }

  const equipment = parseEquipment(raw);
  if (typeof equipment === 'string') return equipment;

  const parsed: CreateResultBody = {
    swimmerId,
    result,
    distance,
    date: raw.date.trim(),
    type: raw.type as ResultCondition,
    water: raw.water as WaterType,
    stroke,
    stages,
    notes: raw.notes,
    ...equipment,
  };
  if (seriesId !== undefined) parsed.seriesId = seriesId;
  return parsed;
}

export function resultsRoutes(db: Db, authConfig: AuthConfig | null) {
  const app = new Hono();

  app.get('/', (c) => {
    const swimmerId = c.req.query('swimmerId');
    const teamId = c.req.query('teamId');
    const seriesId = c.req.query('seriesId');
    const from = c.req.query('from');
    const to = c.req.query('to');

    const where: string[] = [];
    const params: Array<string | number> = [];

    if (swimmerId !== undefined) {
      const id = Number(swimmerId);
      if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid swimmerId' }, 400);
      where.push('r.swimmer_id = ?');
      params.push(id);
    }

    if (teamId !== undefined) {
      const id = Number(teamId);
      if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid teamId' }, 400);
      where.push(
        `r.swimmer_id IN (SELECT swimmer_id FROM swimmer_team WHERE team_id = ?)`,
      );
      params.push(id);
    }

    if (seriesId !== undefined) {
      const id = Number(seriesId);
      if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid seriesId' }, 400);
      where.push('r.series_id = ?');
      params.push(id);
    }

    if (from !== undefined) {
      where.push('r.date >= ?');
      params.push(from);
    }

    if (to !== undefined) {
      where.push('r.date <= ?');
      params.push(to);
    }

    const sql = `
      SELECT ${RESULT_COLUMNS}
      FROM result r
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY r.date DESC, r.id DESC
    `;

    const rows = db.prepare(sql).all(...params) as ResultRow[];
    try {
      return c.json(rows.map(mapResult));
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Mapping error' }, 500);
    }
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

    const parsed = parseCreateBody(body);
    if (typeof parsed === 'string') {
      return c.json({ error: parsed }, 400);
    }

    const swimmer = db
      .prepare(`SELECT id FROM swimmer WHERE id = ?`)
      .get(parsed.swimmerId) as { id: number } | undefined;
    if (!swimmer) {
      return c.json({ error: 'Swimmer not found' }, 404);
    }

    if (parsed.seriesId !== undefined) {
      const series = db
        .prepare(`SELECT id FROM result_series WHERE id = ?`)
        .get(parsed.seriesId) as { id: number } | undefined;
      if (!series) {
        return c.json({ error: 'Series not found' }, 404);
      }
    }

    try {
      const info = db.prepare(`
        INSERT INTO result (
          swimmer_id, result, distance, date, type, stages, notes, series_id, water, stroke,
          swimfin, finger_paddle, hand_paddle, pull_buoy, board, break_belt, snorkel, wetsuit, monofin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        parsed.swimmerId,
        parsed.result,
        parsed.distance,
        parsed.date,
        parsed.type,
        JSON.stringify(parsed.stages),
        parsed.notes,
        parsed.seriesId ?? null,
        parsed.water,
        parsed.stroke,
        parsed.swimfin ? 1 : 0,
        parsed.fingerPaddle ? 1 : 0,
        parsed.handPaddle ? 1 : 0,
        parsed.pullBuoy ? 1 : 0,
        parsed.board ? 1 : 0,
        parsed.breakBelt ? 1 : 0,
        parsed.snorkel ? 1 : 0,
        parsed.wetsuit ? 1 : 0,
        parsed.monofin ? 1 : 0,
      );

      const id = Number(info.lastInsertRowid);
      return c.json({ ...parsed, id }, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Insert failed' }, 500);
    }
  });

  app.put('/:id/date', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const existing = db
      .prepare(`SELECT id FROM result WHERE id = ?`)
      .get(id) as { id: number } | undefined;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (typeof body !== 'object' || body === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const raw = body as Record<string, unknown>;
    if (typeof raw.date !== 'string' || !raw.date.trim()) {
      return c.json({ error: 'Invalid date' }, 400);
    }
    const date = raw.date.trim();
    if (Number.isNaN(Date.parse(date))) {
      return c.json({ error: 'Invalid date' }, 400);
    }

    try {
      db.prepare(`UPDATE result SET date = ? WHERE id = ?`).run(date, id);
      return c.json({ date });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  });

  app.put('/:id/equipment', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const existing = db
      .prepare(`SELECT id FROM result WHERE id = ?`)
      .get(id) as { id: number } | undefined;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (typeof body !== 'object' || body === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const equipment = parseEquipment(body as Record<string, unknown>);
    if (typeof equipment === 'string') {
      return c.json({ error: equipment }, 400);
    }

    try {
      db.prepare(`
        UPDATE result SET
          swimfin = ?,
          finger_paddle = ?,
          hand_paddle = ?,
          pull_buoy = ?,
          board = ?,
          break_belt = ?,
          snorkel = ?,
          wetsuit = ?,
          monofin = ?
        WHERE id = ?
      `).run(
        equipment.swimfin ? 1 : 0,
        equipment.fingerPaddle ? 1 : 0,
        equipment.handPaddle ? 1 : 0,
        equipment.pullBuoy ? 1 : 0,
        equipment.board ? 1 : 0,
        equipment.breakBelt ? 1 : 0,
        equipment.snorkel ? 1 : 0,
        equipment.wetsuit ? 1 : 0,
        equipment.monofin ? 1 : 0,
        id,
      );
      return c.json(equipment);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  });

  app.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid id' }, 400);

    const row = db
      .prepare(`SELECT ${RESULT_COLUMNS} FROM result WHERE id = ?`)
      .get(id) as ResultRow | undefined;
    if (!row) return c.json({ error: 'Not found' }, 404);

    try {
      const swimmer = db
        .prepare(`SELECT name FROM swimmer WHERE id = ?`)
        .get(row.swimmer_id) as { name: string } | undefined;
      return c.json({
        ...mapResult(row),
        swimmerName: swimmer?.name ?? "",
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Mapping error' }, 500);
    }
  });

  return app;
}
