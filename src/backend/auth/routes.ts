import { Hono } from 'hono';
import type { Db } from '../db.ts';
import type { AuthConfig } from './config.ts';
import { buildAuthorizeUrl } from './yandex.ts';
import {
  clearAuthCookies,
  completeAuthWithCode,
} from './session.ts';

export function authRoutes(config: AuthConfig | null, db: Db) {
  const app = new Hono();

  /** Старт логина: фронт кладёт state в sessionStorage и делает location = authorizeUrl. */
  app.get('/login', (c) => {
    if (!config) return c.json({ error: 'Auth is not configured' }, 503);

    const state = crypto.randomUUID();
    return c.json({
      authorizeUrl: buildAuthorizeUrl(config, state),
      state,
      redirectUri: config.redirectUri,
      clientId: config.clientId,
    });
  });

  /** Фронт после своего callback шлёт code; бэк меняет на tokens и ставит httpOnly cookies. */
  app.post('/exchange', async (c) => {
    if (!config) return c.json({ error: 'Auth is not configured' }, 503);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const code =
      typeof body === 'object' &&
        body !== null &&
        'code' in body &&
        typeof (body as { code: unknown }).code === 'string'
        ? (body as { code: string }).code.trim()
        : '';

    if (!code) return c.json({ error: 'code is required' }, 400);

    try {
      const user = await completeAuthWithCode(c, config, db, code);
      return c.json({ ok: true, user });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'token_exchange_failed';
      return c.json({ error: message }, 401);
    }
  });

  app.post('/logout', (c) => {
    if (!config) return c.json({ error: 'Auth is not configured' }, 503);
    clearAuthCookies(c, config);
    return c.json({ ok: true });
  });

  return app;
}
