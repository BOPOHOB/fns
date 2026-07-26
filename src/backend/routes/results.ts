import { Hono } from 'hono';
import type { Db } from '../db.ts';
import { mapResult, type ResultRow } from '../mappers.ts';

const RESULT_COLUMNS = `
  id, swimmer_id, result, distance, date, type, stages, notes, series_id, water
`;

export function resultsRoutes(db: Db) {
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

  app.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid id' }, 400);

    const row = db
      .prepare(`SELECT ${RESULT_COLUMNS} FROM result WHERE id = ?`)
      .get(id) as ResultRow | undefined;
    if (!row) return c.json({ error: 'Not found' }, 404);

    try {
      return c.json(mapResult(row));
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Mapping error' }, 500);
    }
  });

  return app;
}
