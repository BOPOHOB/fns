import { createApp } from './app.ts';
import { tryLoadAuthConfig } from './auth/config.ts';
import { openDb, resolveDbPath } from './db.ts';

const port = Number(Deno.env.get('PORT') ?? 8787);
const hostname = Deno.env.get('HOST') ?? '127.0.0.1';
const dbPath = resolveDbPath();
const db = openDb(dbPath);
const app = createApp(db);
const auth = tryLoadAuthConfig();

console.log(`feelAndSwim API listening on http://${hostname}:${port}`);
console.log(`SQLite: ${dbPath}`);
if (auth) {
  console.log(`OAuth redirect: ${auth.redirectUri}`);
  console.log(`Frontend origin: ${auth.frontendOrigin}`);
} else {
  console.log('OAuth: not configured (set YANDEX_CLIENT_ID / YANDEX_CLIENT_SECRET)');
}

Deno.serve({ port, hostname }, app.fetch);
