# База данных Feel & Swim

SQLite-схема приложения.
DDL в этом каталоге — источник правды для структуры таблиц (без ORM).

API-типы: `src/types/`.

## Масштаб (ориентир)

| Сущность | Порядок величины | Следствие |
|---|---|---|
| группы (`team`) | 10–20 | отдельные индексы не нужны, хватает PK |
| пловцы (`swimmer`) | 100–200 | то же |
| связи (`swimmer_team`) | сотни | PK + индекс по `team_id` |
| серии (`result_series`) | тысячи | индекс по `date` |
| результаты (`result`) | **десятки тысяч** | основная нагрузка — индексы на FK и даты |

SQLite при таком объёме результатов нормален, если не сканировать всю `result` без индекса.

## Файлы

| Файл | Таблица |
|---|---|
| `swimmer.sql` | пловцы |
| `team.sql` | группы |
| `swimmer_team.sql` | many-to-many пловец ↔ группа (+ индекс по `team_id`) |
| `result_series.sql` | серии повторений (+ индекс по `date`) |
| `result.sql` | результаты (+ индексы под частые выборки) |

## Порядок создания

На пустой БД применять в таком порядке (из‑за FK):

1. `swimmer.sql`
2. `team.sql`
3. `swimmer_team.sql`
4. `result_series.sql`
5. `result.sql`

Пример:

```bash
sqlite3 data.db < src/sql/swimmer.sql
sqlite3 data.db < src/sql/team.sql
sqlite3 data.db < src/sql/swimmer_team.sql
sqlite3 data.db < src/sql/result_series.sql
sqlite3 data.db < src/sql/result.sql
```

После открытия соединения в приложении обязательно:

```sql
PRAGMA foreign_keys = ON;
```

Иначе `REFERENCES` и `ON DELETE CASCADE` не работают.

## Индексы

### Не индексируем отдельно
`swimmer`, `team` — мало строк, PK достаточно.

### `swimmer_team`
- PK `(swimmer_id, team_id)` — группы пловца, уникальность пары
- `idx_swimmer_team_team_id (team_id)` — все пловцы группы

### `result_series`
- `idx_result_series_date (date)` — список серий по времени

### `result` (главная таблица)
| Индекс | Зачем |
|---|---|
| `idx_result_swimmer_date (swimmer_id, date)` | история пловца; префикс покрывает и «все результаты пловца» |
| `idx_result_series_id (series_id) WHERE series_id IS NOT NULL` | состав серии; частичный — без одиночных `NULL` |
| `idx_result_date (date)` | общая лента / фильтр по периоду |

Индексы по `type` / `water` / `distance` не заводим: низкая кардинальность, при выборке обычно уже есть пловец или дата. При появлении тяжёлых «рекордов школы по дистанции» можно добавить точечно.

## Сущности

### swimmer
Пловец: имя, дата рождения, пол (`male` / `female`), роль (`user` / `trainer`), опциональный `yandex_login`, публичные и приватные заметки. Уникальный индекс по `yandex_login` (где не NULL).

### team
Группа: название, `trainer_id` → `swimmer.id` (`ON DELETE SET NULL`), заметки, расписание `slots` — JSON-массив строк вида `mon 19:45-21:15`.

### swimmer_team
Связь many-to-many. Составной PK `(swimmer_id, team_id)`, `WITHOUT ROWID`, каскадное удаление с обеих сторон. Один пловец может быть в нескольких группах.

### result_series
План серии: дата, `regime` (сек на повтор), `speed` (целевое время повтора), `repetitions` (**цель** тренировки, не обязана совпадать с числом фактических `result`).

### result
Результат заплыва:

- `result` — время в секундах (число);
- `distance` — метры (`25`…`1500`, километры `2000`…`10000`, морские мили `1852` / `3704`);
- `type` — `competition` | `test` | `workout`;
- `water` — `quarter` (25м) | `fifty` (50м) | `open`;
- `stages` — JSON-массив промежуточных отрезков `{ result, distance }`;
- `series_id` — опциональная привязка к серии (`NULL` = одиночный результат).

В API дистанции отдаются как `DistanceName` (`'50m'`, `'1ml'`, …); в БД хранятся метры.

## Каскады

| Удаление | Что удалится вместе |
|---|---|
| пловец | его `result`, строки в `swimmer_team`; у групп `trainer_id` → `NULL` |
| группа | строки в `swimmer_team` (пловцы и их результаты остаются) |
| серия | все `result` с этим `series_id` |

## Даты

Поля `date` / `birth_date` — `TEXT` без CHECK. Формат и часовой пояс — договорённость приложения (см. комментарии в `src/types`).
