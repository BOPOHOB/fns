import { Hono } from 'hono';
import type { Db } from '../db.ts';
import type { AuthConfig } from '../auth/config.ts';
import { resolveNonSwimmerUser } from '../auth/session.ts';
import { mapSwimmer, type SwimmerRow } from '../mappers.ts';
import type { Sex } from '../../types/swimmer.ts';

export function swimmersRoutes(db: Db, authConfig: AuthConfig | null) {
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

    if (typeof body !== 'object' || body === null) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const raw = body as Record<string, unknown>;

    if (typeof raw.name !== 'string' || !raw.name.trim()) {
      return c.json({ error: 'Invalid name' }, 400);
    }
    const name = raw.name.trim();

    if (raw.sex !== 'male' && raw.sex !== 'female') {
      return c.json({ error: 'Invalid sex' }, 400);
    }
    const sex = raw.sex as Sex;

    if (!Array.isArray(raw.teamIds) || raw.teamIds.length === 0) {
      return c.json({ error: 'Invalid teamIds' }, 400);
    }
    const teamIds: number[] = [];
    for (const item of raw.teamIds) {
      const id = Number(item);
      if (!Number.isInteger(id) || id < 1) {
        return c.json({ error: 'Invalid teamIds' }, 400);
      }
      teamIds.push(id);
    }
    const uniqueTeamIds = [...new Set(teamIds)];

    let birthDate: string | null = null;
    if (raw.birthDate !== undefined && raw.birthDate !== null && raw.birthDate !== '') {
      if (typeof raw.birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.birthDate)) {
        return c.json({ error: 'Invalid birthDate' }, 400);
      }
      birthDate = raw.birthDate;
    }

    try {
      db.exec('BEGIN');

      for (const id of uniqueTeamIds) {
        const team = db
          .prepare(`SELECT id FROM team WHERE id = ?`)
          .get(id) as { id: number } | undefined;
        if (!team) {
          db.exec('ROLLBACK');
          return c.json({ error: `Team ${id} not found` }, 404);
        }
      }

      const info = db
        .prepare(
          `INSERT INTO swimmer (name, birth_date, sex, role, notes, private_notes)
           VALUES (?, ?, ?, 'user', '', '')`,
        )
        .run(name, birthDate, sex);

      const swimmerId = Number(info.lastInsertRowid);

      const insertTeam = db.prepare(
        `INSERT INTO swimmer_team (swimmer_id, team_id) VALUES (?, ?)`,
      );
      for (const teamId of uniqueTeamIds) {
        insertTeam.run(swimmerId, teamId);
      }

      db.exec('COMMIT');

      const row = db
        .prepare(
          `SELECT id, name, birth_date, sex, role, notes FROM swimmer WHERE id = ?`,
        )
        .get(swimmerId) as SwimmerRow;

      return c.json(mapSwimmer(row, uniqueTeamIds), 201);
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

  app.put('/:id/birth-date', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const existing = db
      .prepare(`SELECT id FROM swimmer WHERE id = ?`)
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
    let birthDate: string | null = null;
    if (raw.birthDate !== undefined && raw.birthDate !== null && raw.birthDate !== '') {
      if (typeof raw.birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.birthDate)) {
        return c.json({ error: 'Invalid birthDate' }, 400);
      }
      birthDate = raw.birthDate;
    }

    try {
      db.prepare(`UPDATE swimmer SET birth_date = ? WHERE id = ?`).run(birthDate, id);
      return c.json({ birthDate });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  });

  app.put('/:id/name', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const existing = db
      .prepare(`SELECT id FROM swimmer WHERE id = ?`)
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
    if (typeof raw.name !== 'string' || !raw.name.trim()) {
      return c.json({ error: 'Invalid name' }, 400);
    }
    const name = raw.name.trim();

    try {
      db.prepare(`UPDATE swimmer SET name = ? WHERE id = ?`).run(name, id);
      return c.json({ name });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  });

  return app;
}
