/** Публичный пользователь после OAuth (ответ /api/me и /api/auth/exchange). */
type AuthUser = {
  id: string;
  login: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  /** Если login совпал с swimmer.yandex_login, иначе null */
  swimmerId: number | null;
};

/** Ответ GET /api/me */
type MeResponse = {
  user: AuthUser | null;
  error?: string;
};

/** Ответ GET /api/auth/login */
type AuthLoginResponse = {
  authorizeUrl: string;
  state: string;
  redirectUri: string;
  clientId: string;
};

/** Тело POST /api/auth/exchange */
type AuthExchangeRequest = {
  code: string;
};

/** Ответ POST /api/auth/exchange */
type AuthExchangeResponse = {
  ok: true;
  user: AuthUser;
};

export type {
  AuthUser,
  MeResponse,
  AuthLoginResponse,
  AuthExchangeRequest,
  AuthExchangeResponse,
};
