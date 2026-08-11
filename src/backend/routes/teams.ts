import { Hono } from 'hono';
import type { Db } from '../db.ts';
import type { AuthConfig } from '../auth/config.ts';
import { resolveNonSwimmerUser } from '../auth/session.ts';
import { mapTeam, type TeamRow } from '../mappers.ts';

export function teamsRoutes(db: Db, authConfig: AuthConfig | null) {
  const app = new Hono();

  app.get('/', (c) => {
    const rows = db
      .prepare(
        `SELECT id, name, slots, trainer_id, notes
         FROM team
         ORDER BY name COLLATE NOCASE`,
      )
      .all() as TeamRow[];
    return c.json(rows.map(mapTeam));
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

    if (typeof raw.name !== 'string') {
      return c.json({ error: 'Invalid name' }, 400);
    }
    const name = raw.name.trim();

    if (typeof raw.notes !== 'string') {
      return c.json({ error: 'Invalid notes' }, 400);
    }

    let trainerId: number | null = null;
    if (raw.trainerId !== undefined && raw.trainerId !== null) {
      const id = Number(raw.trainerId);
      if (!Number.isInteger(id) || id < 1) {
        return c.json({ error: 'Invalid trainerId' }, 400);
      }
      const trainer = db
        .prepare(`SELECT id, role FROM swimmer WHERE id = ?`)
        .get(id) as { id: number; role: string } | undefined;
      if (!trainer) {
        return c.json({ error: 'Trainer not found' }, 404);
      }
      if (trainer.role !== 'trainer') {
        return c.json({ error: 'Swimmer is not a trainer' }, 400);
      }
      trainerId = id;
    }

    let slots: string[] = [];
    if (raw.slots !== undefined) {
      if (!Array.isArray(raw.slots) || raw.slots.some((s) => typeof s !== 'string')) {
        return c.json({ error: 'Invalid slots' }, 400);
      }
      slots = raw.slots as string[];
    }

    try {
      const info = db
        .prepare(
          `INSERT INTO team (name, slots, trainer_id, notes) VALUES (?, ?, ?, ?)`,
        )
        .run(name, JSON.stringify(slots), trainerId, raw.notes);

      const id = Number(info.lastInsertRowid);
      const row = db
        .prepare(`SELECT id, name, slots, trainer_id, notes FROM team WHERE id = ?`)
        .get(id) as TeamRow;

      return c.json(mapTeam(row), 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Insert failed' }, 500);
    }
  });

  app.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) return c.json({ error: 'Invalid id' }, 400);

    const row = db
      .prepare(
        `SELECT id, name, slots, trainer_id, notes
         FROM team WHERE id = ?`,
      )
      .get(id) as TeamRow | undefined;
    if (!row) return c.json({ error: 'Not found' }, 404);
    return c.json(mapTeam(row));
  });

  app.put('/:id/trainer', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const teamId = Number(c.req.param('id'));
    if (!Number.isInteger(teamId) || teamId < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const team = db
      .prepare(`SELECT id FROM team WHERE id = ?`)
      .get(teamId) as { id: number } | undefined;
    if (!team) return c.json({ error: 'Not found' }, 404);

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
    let trainerId: number | null = null;
    if (raw.trainerId !== undefined && raw.trainerId !== null) {
      const id = Number(raw.trainerId);
      if (!Number.isInteger(id) || id < 1) {
        return c.json({ error: 'Invalid trainerId' }, 400);
      }
      const trainer = db
        .prepare(`SELECT id, role FROM swimmer WHERE id = ?`)
        .get(id) as { id: number; role: string } | undefined;
      if (!trainer) {
        return c.json({ error: 'Trainer not found' }, 404);
      }
      if (trainer.role !== 'trainer') {
        return c.json({ error: 'Swimmer is not a trainer' }, 400);
      }
      trainerId = id;
    }

    try {
      db.prepare(`UPDATE team SET trainer_id = ? WHERE id = ?`).run(trainerId, teamId);
      return c.json({ trainerId });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  });

  app.put('/:id/members', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const teamId = Number(c.req.param('id'));
    if (!Number.isInteger(teamId) || teamId < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const team = db
      .prepare(`SELECT id FROM team WHERE id = ?`)
      .get(teamId) as { id: number } | undefined;
    if (!team) return c.json({ error: 'Not found' }, 404);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (typeof body !== 'object' || body === null || !Array.isArray((body as { swimmerIds?: unknown }).swimmerIds)) {
      return c.json({ error: 'Invalid swimmerIds' }, 400);
    }

    const rawIds = (body as { swimmerIds: unknown[] }).swimmerIds;
    const swimmerIds: number[] = [];
    for (const item of rawIds) {
      const id = Number(item);
      if (!Number.isInteger(id) || id < 1) {
        return c.json({ error: 'Invalid swimmerIds' }, 400);
      }
      swimmerIds.push(id);
    }

    const uniqueIds = [...new Set(swimmerIds)];
    for (const id of uniqueIds) {
      const swimmer = db
        .prepare(`SELECT id FROM swimmer WHERE id = ?`)
        .get(id) as { id: number } | undefined;
      if (!swimmer) {
        return c.json({ error: `Swimmer ${id} not found` }, 404);
      }
    }

    try {
      db.exec('BEGIN');
      db.prepare(`DELETE FROM swimmer_team WHERE team_id = ?`).run(teamId);
      const insert = db.prepare(
        `INSERT INTO swimmer_team (swimmer_id, team_id) VALUES (?, ?)`,
      );
      for (const swimmerId of uniqueIds) {
        insert.run(swimmerId, teamId);
      }
      db.exec('COMMIT');
      return c.json({ swimmerIds: uniqueIds });
    } catch (e) {
      try {
        db.exec('ROLLBACK');
      } catch {
        // ignore
      }
      return c.json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  });

  app.delete('/:id', async (c) => {
    const auth = await resolveNonSwimmerUser(c, authConfig, db);
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'Invalid id' }, 400);
    }

    const team = db
      .prepare(`SELECT id FROM team WHERE id = ?`)
      .get(id) as { id: number } | undefined;
    if (!team) return c.json({ error: 'Not found' }, 404);

    try {
      db.prepare(`DELETE FROM team WHERE id = ?`).run(id);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Delete failed' }, 500);
    }
  });

  return app;
}
