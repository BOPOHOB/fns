# backend проекта

Бекенд проекта остаётся минималистичным. Он обеспечивает только CRUD-ручки, авторизацию и управление базой данных.

Бэкенд работает на Deno напрямую из исходников (без компиляции): Hono + `node:sqlite` (`DatabaseSync`), без ORM.

```bash
# из корня feelAndSwim
deno task backend          # http://127.0.0.1:8787
deno task backend:dev      # то же + --watch

# опционально
DB_PATH=/path/to/data.db PORT=8787 deno task backend
```

По умолчанию `DB_PATH` = `../fns/data.db` относительно корня feelAndSwim.

Типы API — из `src/types`, общие хелперы (дистанции) — из `src/shared`. При каждом открытии БД включается `PRAGMA foreign_keys = ON`.

Авторизация будет осуществляться через OAuth (позже).

## Публичные GET (без auth)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | liveness |
| GET | `/api/swimmers` | список пловцов (`PublicSwimmer`, без `privateNotes`) |
| GET | `/api/swimmers/:id` | один пловец |
| GET | `/api/teams` | список групп |
| GET | `/api/teams/:id` | одна группа |
| GET | `/api/series` | список серий |
| GET | `/api/series/:id` | одна серия |
| GET | `/api/results` | результаты; query: `swimmerId`, `teamId`, `seriesId`, `from`, `to` (даты) |
| GET | `/api/results/:id` | один результат |

Ответы в camelCase, дистанции как `DistanceName` (`25m`…`2ml`), `slots`/`stages` — распарсенный JSON.

## Чтение и модификация данных

У нас 4 сущности: пловцы (`swimmer`), серии (`series`), результаты (`result`) и группы (`team`). Все описаны в `src/types`. На проекте должен быть SSR и быстрая загрузка начальных данных через отдельные списковые ручки. После загрузки главной страницы фронтенд отдельно сходит в `/api/me` и решит, авторизован ли человек.

Публичные списки должны отдаваться быстро; проверка авторизации и мутации могут зависеть от OAuth и работать медленнее.

Мутации, OAuth и `privateNotes` по пловцу — следующие шаги, пока не реализованы.
