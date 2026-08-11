import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Db } from './db.ts';
import { tryLoadAuthConfig } from './auth/config.ts';
import { authRoutes } from './auth/routes.ts';
import { swimmersRoutes } from './routes/swimmers.ts';
import { teamsRoutes } from './routes/teams.ts';
import { resultsRoutes } from './routes/results.ts';
import { seriesRoutes } from './routes/series.ts';
import { meRoutes } from './routes/me.ts';

export function createApp(db: Db) {
  const app = new Hono();
  const authConfig = tryLoadAuthConfig();

  const frontendOrigin = authConfig?.frontendOrigin ??
    (Deno.env.get('FRONTEND_ORIGIN') ?? 'http://localhost:5173').replace(/\/$/, '');

  app.use(
    '*',
    cors({
      origin: frontendOrigin,
      credentials: true,
      allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
    }),
  );

  app.get('/api/health', (c) =>
    c.json({
      ok: true,
      authConfigured: Boolean(authConfig),
    }),
  );

  app.route('/api/auth', authRoutes(authConfig, db));
  app.route('/api/me', meRoutes(authConfig, db));

  app.route('/api/swimmers', swimmersRoutes(db));
  app.route('/api/teams', teamsRoutes(db));
  app.route('/api/results', resultsRoutes(db, authConfig));
  app.route('/api/series', seriesRoutes(db, authConfig));

  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  return app;
}
