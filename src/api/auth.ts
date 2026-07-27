import type {
  AuthExchangeResponse,
  AuthLoginResponse,
  AuthUser,
  MeResponse,
} from '../types/auth.ts';
import { apiFetch } from './client.ts';

const OAUTH_STATE_KEY = 'oauth_state';

export function saveOauthState(state: string): void {
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
}

export function takeOauthState(): string | null {
  const value = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  return value;
}

export async function fetchLogin(): Promise<AuthLoginResponse> {
  return apiFetch<AuthLoginResponse>('/api/auth/login');
}

export async function exchangeCode(code: string): Promise<AuthUser> {
  const res = await apiFetch<AuthExchangeResponse>('/api/auth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return res.user;
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await apiFetch<MeResponse>('/api/me');
  return res.user;
}

export async function logoutRequest(): Promise<void> {
  await apiFetch<{ ok: true }>('/api/auth/logout', { method: 'POST' });
}

/** Старт OAuth: сохраняет state и уводит браузер на Яндекс. */
export async function startYandexLogin(): Promise<void> {
  const { authorizeUrl, state } = await fetchLogin();
  saveOauthState(state);
  location.assign(authorizeUrl);
}
