import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { AuthUser } from '../../types/auth.ts';
import type { Db } from '../db.ts';
import type { AuthConfig } from './config.ts';
import { withSwimmerId } from './swimmerLink.ts';
import {
  exchangeCode,
  fetchYandexUser,
  refreshAccessToken,
} from './yandex.ts';

export const COOKIE_ACCESS = 'access';
export const COOKIE_REFRESH = 'refresh';

/** Лимит браузеров: Max-Age ≤ 400 дней. */
const REFRESH_MAX_AGE_SEC = 400 * 24 * 3600;

function baseCookieOpts(config: AuthConfig) {
  return {
    path: '/',
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'Lax' as const,
  };
}

export function setTokenCookies(
  c: Context,
  config: AuthConfig,
  tokens: { accessToken: string; refreshToken?: string; expiresIn: number },
) {
  const base = baseCookieOpts(config);
  setCookie(c, COOKIE_ACCESS, tokens.accessToken, {
    ...base,
    maxAge: tokens.expiresIn,
  });
  if (tokens.refreshToken) {
    setCookie(c, COOKIE_REFRESH, tokens.refreshToken, {
      ...base,
      maxAge: REFRESH_MAX_AGE_SEC,
    });
  }
}

export function clearAuthCookies(c: Context, config: AuthConfig) {
  const base = baseCookieOpts(config);
  deleteCookie(c, COOKIE_ACCESS, base);
  deleteCookie(c, COOKIE_REFRESH, base);
}

/**
 * Достаёт access token: из cookie, либо refresh.
 * Не редиректит. При провале refresh чистит cookies.
 */
export async function resolveAccessToken(
  c: Context,
  config: AuthConfig,
): Promise<string | null> {
  const access = getCookie(c, COOKIE_ACCESS);
  if (access) return access;

  const refresh = getCookie(c, COOKIE_REFRESH);
  if (!refresh) return null;

  try {
    const tokens = await refreshAccessToken(config, refresh);
    setTokenCookies(c, config, tokens);
    return tokens.accessToken;
  } catch {
    clearAuthCookies(c, config);
    return null;
  }
}

export async function resolveAuthUser(
  c: Context,
  config: AuthConfig,
  db: Db,
): Promise<AuthUser | null> {
  const token = await resolveAccessToken(c, config);
  if (!token) return null;

  try {
    return withSwimmerId(db, await fetchYandexUser(token));
  } catch {
    const refresh = getCookie(c, COOKIE_REFRESH);
    if (!refresh) {
      clearAuthCookies(c, config);
      return null;
    }
    try {
      const tokens = await refreshAccessToken(config, refresh);
      setTokenCookies(c, config, tokens);
      return withSwimmerId(db, await fetchYandexUser(tokens.accessToken));
    } catch {
      clearAuthCookies(c, config);
      return null;
    }
  }
}

export async function completeAuthWithCode(
  c: Context,
  config: AuthConfig,
  db: Db,
  code: string,
): Promise<AuthUser> {
  const tokens = await exchangeCode(config, code);
  setTokenCookies(c, config, tokens);
  return withSwimmerId(db, await fetchYandexUser(tokens.accessToken));
}
