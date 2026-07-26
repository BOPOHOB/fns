import { Hono } from 'hono';
import type { Db } from '../db.ts';
import { mapSeries, type SeriesRow } from '../mappers.ts';

export function seriesRoutes(db: Db) {
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
