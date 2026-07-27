import type { Db } from '../db.ts';
import type { AuthUser } from '../../types/auth.ts';

/** Проставляет swimmerId по yandex_login (или null). */
export function withSwimmerId(db: Db, user: AuthUser): AuthUser {
  const row = db
    .prepare(
      `SELECT id FROM swimmer WHERE yandex_login = ? COLLATE NOCASE LIMIT 1`,
    )
    .get(user.login) as { id: number } | undefined;

  return { ...user, swimmerId: row?.id ?? null };
}
