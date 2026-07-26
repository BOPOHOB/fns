import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Db } from './db.ts';
import { swimmersRoutes } from './routes/swimmers.ts';
import { teamsRoutes } from './routes/teams.ts';
import { resultsRoutes } from './routes/results.ts';
import { seriesRoutes } from './routes/series.ts';

export function createApp(db: Db) {
  const app = new Hono();

  app.use(
    '/api/*',
    cors({
      origin: (origin) => origin || '*',
      allowMethods: ['GET', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
    }),
  );

  app.get('/api/health', (c) => c.json({ ok: true }));

  app.route('/api/swimmers', swimmersRoutes(db));
  app.route('/api/teams', teamsRoutes(db));
  app.route('/api/results', resultsRoutes(db));
  app.route('/api/series', seriesRoutes(db));

  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  return app;
}
