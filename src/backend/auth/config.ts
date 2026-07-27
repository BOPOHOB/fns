/** Конфиг OAuth / cookies из env. */

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export type AuthConfig = {
  clientId: string;
  clientSecret: string;
  /**
   * Redirect URI на **фронте** (React callback).
   * Должен совпадать с кабинетом Яндекса и с authorize/exchange.
   */
  redirectUri: string;
  /** Origin фронта — CORS */
  frontendOrigin: string;
  cookieSecure: boolean;
};

export function loadAuthConfig(): AuthConfig {
  const frontendOrigin = (
    Deno.env.get('FRONTEND_ORIGIN') ?? 'http://localhost:5173'
  ).replace(/\/$/, '');

  const redirectUri =
    Deno.env.get('OAUTH_REDIRECT_URI') ??
    `${frontendOrigin}/auth/callback`;

  const cookieSecure =
    Deno.env.get('COOKIE_SECURE') === '1' ||
    Deno.env.get('COOKIE_SECURE') === 'true' ||
    frontendOrigin.startsWith('https://') ||
    redirectUri.startsWith('https://');

  return {
    clientId: required('YANDEX_CLIENT_ID'),
    clientSecret: required('YANDEX_CLIENT_SECRET'),
    redirectUri,
    frontendOrigin,
    cookieSecure,
  };
}

/** Без env сервер поднимается; auth-ручки вернут 503 / user: null. */
export function tryLoadAuthConfig(): AuthConfig | null {
  try {
    return loadAuthConfig();
  } catch {
    return null;
  }
}
