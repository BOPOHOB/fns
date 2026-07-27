import { Hono } from 'hono';
import type { Db } from '../db.ts';
import { mapSwimmer, type SwimmerRow } from '../mappers.ts';

export function swimmersRoutes(db: Db) {
  const app = new Hono();

  const teamIdsBySwimmer = () => {
    const rows = db
      .prepare('SELECT swimmer_id, team_id FROM swimmer_team')
      .all() as Array<{ swimmer_id: number; team_id: number }>;
    const map = new Map<number, number[]>();
    for (const row of rows) {
      const list = map.get(row.swimmer_id) ?? [];
      list.push(row.team_id);
      map.set(row.swimmer_id, list);
    }
    return map;
  };

  app.get('/', (c) => {
    const rows = db
      .prepare(
        `SELECT id, name, birth_date, sex, role, notes
         FROM swimmer
         ORDER BY name COLLATE NOCASE`,
      )
      .all() as SwimmerRow[];
    const teams = teamIdsBySwimmer();
    return c.json(rows.map((row) => mapSwimmer(row, teams.get(row.id) ?? [])));
  });

  app.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid id' }, 400);

    const row = db
      .prepare(
        `SELECT id, name, birth_date, sex, role, notes
         FROM swimmer WHERE id = ?`,
      )
      .get(id) as SwimmerRow | undefined;
    if (!row) return c.json({ error: 'Not found' }, 404);

    const teamId = (
      db
        .prepare('SELECT team_id FROM swimmer_team WHERE swimmer_id = ?')
        .all(id) as Array<{ team_id: number }>
    ).map((r) => r.team_id);

    return c.json(mapSwimmer(row, teamId));
  });

  return app;
}
