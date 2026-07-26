import { Hono } from 'hono';
import type { Db } from '../db.ts';
import { mapTeam, type TeamRow } from '../mappers.ts';

export function teamsRoutes(db: Db) {
  const app = new Hono();

  app.get('/', (c) => {
    const rows = db
      .prepare(
        `SELECT id, name, slots, trainer, notes
         FROM team
         ORDER BY name COLLATE NOCASE`,
      )
      .all() as TeamRow[];
    return c.json(rows.map(mapTeam));
  });

  app.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid id' }, 400);

    const row = db
      .prepare(
        `SELECT id, name, slots, trainer, notes
         FROM team WHERE id = ?`,
      )
      .get(id) as TeamRow | undefined;
    if (!row) return c.json({ error: 'Not found' }, 404);
    return c.json(mapTeam(row));
  });

  return app;
}
