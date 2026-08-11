import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Корень feelAndSwim/ */
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Путь к SQLite. По умолчанию — `data.db` в корне проекта.
 * Переопределение: DB_PATH.
 */
export function resolveDbPath(): string {
  if (Deno.env.get('DB_PATH')) return path.resolve(Deno.env.get('DB_PATH')!);
  return path.resolve(PROJECT_ROOT, 'data.db');
}

export function openDb(dbPath = resolveDbPath()): DatabaseSync {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export type Db = DatabaseSync;
