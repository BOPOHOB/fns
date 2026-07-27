# backend проекта

Бекенд проекта остаётся минималистичным. Он обеспечивает только CRUD-ручки, авторизацию и управление базой данных.

Бэкенд работает на Deno напрямую из исходников (без компиляции): Hono + `node:sqlite` (`DatabaseSync`), без ORM.

```bash
# из корня feelAndSwim
deno task backend          # http://127.0.0.1:8787
deno task backend:dev      # то же + --watch

# OAuth (Яндекс ID) — Redirect URI на фронте
export YANDEX_CLIENT_ID=...
export YANDEX_CLIENT_SECRET=...
export FRONTEND_ORIGIN=http://localhost:5173
export OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
# опционально: HOST, PORT, DB_PATH, COOKIE_SECURE=true
deno task backend
```

По умолчанию `OAUTH_REDIRECT_URI` = `{FRONTEND_ORIGIN}/auth/callback`, `DB_PATH` = `../fns/data.db`.

Типы API — из `src/types`, общие хелперы — из `src/shared`. При open БД: `PRAGMA foreign_keys = ON`.

Авторизация — **Yandex OAuth**: callback на **React**, обмен `code` на бэке, токены в httpOnly cookies `access` / `refresh`.

## Публичные GET (без auth)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | liveness (`authConfigured`) |
| GET | `/api/swimmers` | список пловцов (`PublicSwimmer`, без `privateNotes`) |
| GET | `/api/swimmers/:id` | один пловец |
| GET | `/api/teams` | список групп |
| GET | `/api/teams/:id` | одна группа |
| GET | `/api/series` | список серий |
| GET | `/api/series/:id` | одна серия |
| GET | `/api/results` | фильтры: `swimmerId`, `teamId`, `seriesId`, `from`, `to` |
| GET | `/api/results/:id` | один результат |

## Auth (всё под `/api`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/auth/login` | `{ authorizeUrl, state, redirectUri, clientId }` — без redirect |
| POST | `/api/auth/exchange` | body `{ code }` → Set-Cookie + `{ ok, user }` |
| POST | `/api/auth/logout` | сброс cookies → `{ ok: true }` |
| GET | `/api/me` | `{ user }` или `{ user: null }` — без redirect на OAuth |

В кабинете Яндекса Redirect URI = `OAUTH_REDIRECT_URI` (страница React).

CORS: `credentials: true`, origin = `FRONTEND_ORIGIN`.

### Контракт для фронта

Реализовано в `src/api/auth.ts`, `src/pages/AuthCallback.tsx`, `Session`.

Vite proxy: `/api` → `http://127.0.0.1:8787` (same-origin cookies).  
`FRONTEND_ORIGIN=http://localhost:5173`,  
`OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback`.

1. `GET /api/auth/login` → `sessionStorage` + redirect на Яндекс  
2. `/auth/callback` → проверка state → `POST /api/auth/exchange`  
3. `GET /api/me` при старте `Session`  
4. `POST /api/auth/logout`

Типы: `src/types/auth.ts`.

## Чтение и модификация данных

Публичные списки — быстро и анонимно. После загрузки главной фронт ходит в `/api/me`. Мутации (позже) — те же cookies; `privateNotes` — отдельная auth-ручка, пока нет.
