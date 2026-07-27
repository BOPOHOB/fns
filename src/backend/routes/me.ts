import { Hono } from 'hono';
import type { Db } from '../db.ts';
import type { AuthConfig } from '../auth/config.ts';
import { resolveAuthUser } from '../auth/session.ts';

export function meRoutes(config: AuthConfig | null, db: Db) {
  const app = new Hono();

  app.get('/', async (c) => {
    if (!config) {
      return c.json({ user: null, error: 'Auth is not configured' }, 200);
    }

    try {
      const user = await resolveAuthUser(c, config, db);
      return c.json({ user });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'auth_error';
      return c.json({ user: null, error: message }, 200);
    }
  });

  return app;
}
