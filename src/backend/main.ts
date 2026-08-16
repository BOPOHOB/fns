import { createApp } from './app.ts';
import { tryLoadAuthConfig } from './auth/config.ts';
import { openDb, resolveDbPath } from './db.ts';
import { join, fromFileUrl, dirname } from 'jsr:@std/path';

const port = Number(Deno.env.get('PORT') ?? 8787);
const hostname = Deno.env.get('HOST') ?? '127.0.0.1';
const dbPath = resolveDbPath();
const db = openDb(dbPath);

const here = dirname(fromFileUrl(import.meta.url));
// src/backend -> project root (dev) or /opt/feelandswim/src/backend -> /opt/feelandswim
const projectRoot = Deno.env.get('PROJECT_ROOT') ?? join(here, '../..');
const clientDir = join(projectRoot, 'dist/client');
const serverEntry = join(projectRoot, 'dist/server/entry-server.js');

const app = createApp(db, { clientDir, serverEntry });
const auth = tryLoadAuthConfig();

console.log(`feelAndSwim listening on http://${hostname}:${port}`);
console.log(`SQLite: ${dbPath}`);
console.log(`Client: ${clientDir}`);
console.log(`SSR entry: ${serverEntry}`);
if (auth) {
  console.log(`OAuth redirect: ${auth.redirectUri}`);
  console.log(`Frontend origin: ${auth.frontendOrigin}`);
} else {
  console.log('OAuth: not configured (set YANDEX_CLIENT_ID / YANDEX_CLIENT_SECRET)');
}

Deno.serve({ port, hostname }, app.fetch);
