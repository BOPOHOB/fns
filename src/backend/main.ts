import { createApp } from './app.ts';
import { openDb, resolveDbPath } from './db.ts';

const port = Number(Deno.env.get('PORT') ?? 8787);
const dbPath = resolveDbPath();
const db = openDb(dbPath);
const app = createApp(db);

console.log(`feelAndSwim API listening on http://127.0.0.1:${port}`);
console.log(`SQLite: ${dbPath}`);

Deno.serve({ port, hostname: '127.0.0.1' }, app.fetch);
