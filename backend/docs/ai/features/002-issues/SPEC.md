# SPEC.md
# Фича: issues

## 1. Цель
Сделать практичный модуль управления задачами для MVP:
- создание задачи внутри проекта;
- получение задачи и списка backlog-задач проекта;
- обновление и удаление задачи;
- перенос задачи между backlog и sprint;
- изменение статуса задачи на board;
- изменение позиции задачи в backlog и на board.

Фича реализуется как отдельный модуль `issues`, но опирается на минимальные контракты модулей `projects`, `statuses` и `sprints`.

## 2. Границы фичи
### Входит
- `POST /projects/:project_id/issues`
- `GET /projects/:project_id/issues/:issue_id`
- `PATCH /projects/:project_id/issues/:issue_id`
- `DELETE /projects/:project_id/issues/:issue_id`
- `GET /projects/:project_id/issues/backlog`
- `POST /projects/:project_id/issues/:issue_id/sprint`
- `PATCH /projects/:project_id/issues/:issue_id/status`
- `PATCH /projects/:project_id/issues/:issue_id/position`
- базовая проверка доступа пользователя к проекту
- валидация принадлежности `status` и `sprint` к проекту
- Swagger/OpenAPI-описание endpoint'ов модуля

### Не входит
- CRUD проектов
- CRUD статусов проекта
- CRUD и жизненный цикл спринтов
- комментарии к задачам
- история изменений задачи
- приоритеты, дедлайны, story points, labels, attachments, subtasks, epics
- массовые операции над задачами

## 3. Пользовательские сценарии
1. Участник проекта создает новую задачу в backlog проекта -> задача создается с типом `task` или `bug`, получает стартовый статус проекта и позицию в конце backlog.
2. Участник проекта открывает карточку задачи -> получает полные данные задачи.
3. Участник проекта редактирует название, описание, тип и исполнителя задачи -> изменения сохраняются.
4. Автор задачи или владелец проекта удаляет задачу -> задача исчезает из backlog / sprint / board.
5. Участник проекта запрашивает backlog -> получает список задач проекта без `sprint_id`, отсортированный по `rank_position`.
6. Участник проекта переносит задачу из backlog в sprint -> у задачи появляется `sprint_id`, задача сохраняет принадлежность проекту и становится частью sprint planning / board.
7. Участник проекта возвращает задачу из sprint обратно в backlog -> `sprint_id` становится `null`, задача попадает в конец backlog.
8. Участник проекта перетаскивает задачу между колонками на board -> у задачи меняется `status_id`.
9. Участник проекта меняет порядок задач drag-n-drop -> обновляется `target_index`, а в БД пересчитывается `rank_position`.

## 4. Бизнес-правила
- Любая задача принадлежит ровно одному проекту.
- Любая задача имеет автора `reporter_id`.
- Любая задача может иметь исполнителя (`assignee_id`) или быть без исполнителя.
- Исполнитель, если указан, должен быть участником того же проекта.
- Поддерживаются только два типа задач MVP: `task` и `bug`. В БД тип хранится через `type_id -> issue_types.code`.
- Задача может быть либо в backlog (`sprint_id = null`), либо внутри одного sprint.
- Статус задачи всегда должен принадлежать тому же проекту, что и сама задача.
- При создании задачи модуль `issues` должен получить стартовый статус проекта от зависимого контракта `statuses`.
- Новая задача создается в конце backlog проекта.
- Для каждой новой задачи внутри проекта автоматически вычисляется следующий `issue_number`.
- `GET /projects/:project_id/issues/backlog` возвращает только задачи с `sprint_id = null`.
- Перенос задачи в sprint разрешен только если sprint принадлежит тому же проекту и допускает добавление задач.
- Возврат задачи из sprint в backlog происходит через тот же сценарий переноса с `sprint_id = null`.
- Изменение статуса на board разрешено только для задачи, которая находится в sprint и участвует в board-сценарии.
- Изменение позиции работает в пределах текущего списка:
  - backlog для задач без sprint;
  - текущая колонка board для задач внутри sprint.
- Для перемещения задачи в другую колонку сначала меняется `status_id`, затем при необходимости вызывается изменение позиции.
- На MVP любой участник проекта может создавать, читать, обновлять, переносить и двигать задачи.
- Удалять задачу может только автор задачи или владелец проекта.
- Повторный перенос в тот же `sprint_id`, повторная установка того же `status_id` или повторная установка того же `rank_position` считаются допустимым no-op.
- При конфликте параллельных перестановок применяется стратегия `last write wins`.

## 5. API-контракт
### `POST /projects/:project_id/issues`
Request:
```json
{
  "title": "Исправить фильтр по статусу",
  "description": "Фильтр не учитывает пустое значение",
  "type_code": "bug",
  "assignee_id": "uuid"
}
```
Response `201`:
```json
{
  "id": "uuid",
  "issue_number": "15",
  "project_id": "uuid",
  "sprint_id": null,
  "status_id": "uuid",
  "reporter_id": "uuid",
  "assignee_id": "uuid",
  "title": "Исправить фильтр по статусу",
  "description": "Фильтр не учитывает пустое значение",
  "type_id": 2,
  "type_code": "bug",
  "rank_position": 12,
  "created_at": "2026-04-27T10:00:00.000Z",
  "updated_at": "2026-04-27T10:00:00.000Z"
}
```

### `GET /projects/:project_id/issues/:issue_id`
Response `200`:
```json
{
  "id": "uuid",
  "issue_number": "15",
  "project_id": "uuid",
  "sprint_id": "uuid",
  "status_id": "uuid",
  "reporter_id": "uuid",
  "assignee_id": "uuid",
  "title": "Исправить фильтр по статусу",
  "description": "Фильтр не учитывает пустое значение",
  "type_id": 2,
  "type_code": "bug",
  "rank_position": 3,
  "created_at": "2026-04-27T10:00:00.000Z",
  "updated_at": "2026-04-27T10:30:00.000Z"
}
```

### `PATCH /projects/:project_id/issues/:issue_id`
Request:
```json
{
  "title": "Исправить фильтр по статусу и исполнителю",
  "description": "Фильтр не учитывает пустое значение и current user",
  "type_code": "task",
  "assignee_id": "uuid"
}
```
Response `200`: обновленная задача по той же схеме, что в `GET`.

### `DELETE /projects/:project_id/issues/:issue_id`
Response `200`:
```json
{
  "success": true
}
```

### `GET /projects/:project_id/issues/backlog`
Response `200`:
```json
[
  {
    "id": "uuid",
    "issue_number": "15",
    "project_id": "uuid",
    "sprint_id": null,
    "status_id": "uuid",
    "reporter_id": "uuid",
    "assignee_id": null,
    "title": "Подготовить экран backlog",
    "description": null,
    "type_id": 1,
    "type_code": "task",
    "rank_position": 0,
    "created_at": "2026-04-27T10:00:00.000Z",
    "updated_at": "2026-04-27T10:00:00.000Z"
  }
]
```

### `POST /projects/:project_id/issues/:issue_id/sprint`
Request:
```json
{
  "sprint_id": "uuid"
}
```
Response `200`: обновленная задача.

Для возврата задачи в backlog:
```json
{
  "sprint_id": null
}
```

### `PATCH /projects/:project_id/issues/:issue_id/status`
Request:
```json
{
  "status_id": "uuid"
}
```
Response `200`: обновленная задача.

### `PATCH /projects/:project_id/issues/:issue_id/position`
Request:
```json
{
  "target_index": 2
}
```
Response `200`: обновленная задача.

### Swagger/OpenAPI (базово для MVP)
- Все endpoint'ы фичи `issues` должны быть описаны в Swagger.
- Для каждого endpoint должны быть указаны:
  - краткое описание операции;
  - параметры `project_id` и `issue_id`, где применимо;
  - схема request body;
  - основные ответы (`200/201/400/401/403/404/409` где применимо).
- В Swagger должны быть явно описаны значения enum для `type_code`.

## 6. Модели данных / изменения в БД
Минимальная модель `issues`:
- `id: string (uuid)`
- `project_id: string (fk -> projects.id)`
- `issue_number: bigint (unique внутри project)`
- `sprint_id: string | null (fk -> sprints.id)`
- `status_id: string (fk -> statuses.id)`
- `reporter_id: string (fk -> users.id)`
- `assignee_id: string | null (fk -> users.id)`
- `type_id: smallint (fk -> issue_types.id)`
- `title: string`
- `description: string | null`
- `rank_position: decimal | null`
- `created_at: Date`
- `updated_at: Date`

Публичный API использует `snake_case` и возвращает DB-aligned поля:
- `reporter_id`
- `type_id`
- `type_code`
- `rank_position`

Минимальные требования к индексации:
- индекс по `project_id`
- индекс по `project_id, sprint_id, status_id` для board-сценариев
- индекс по `project_id, rank_position` для backlog reorder
- индекс по `assignee_id`

Минимальные инварианты:
- `status_id` должен ссылаться на статус того же проекта
- `sprint_id`, если не `null`, должен ссылаться на sprint того же проекта
- `assignee_id`, если не `null`, должен принадлежать активному участнику проекта
- `type_id` должен указывать на запись в `issue_types`, чье `code` поддерживается API (`task | bug`)

## 7. Валидация
- `title`: обязателен при создании, `trim`, длина 1..200.
- `description`: опционален, `trim`, длина до 5000.
- `type_code`: обязателен при создании, enum `task | bug`.
- `assignee_id`: опционален, валидный `uuid`.
- `sprint_id`: валидный `uuid` или `null`.
- `status_id`: обязателен для смены статуса, валидный `uuid`.
- `target_index`: обязателен для перестановки, целое число `>= 0`.
- `PATCH /projects/:project_id/issues/:issue_id` принимает только разрешенные поля.
- Пустые строки после `trim` считаются невалидными.
- Лишние поля в DTO отклоняются (`whitelist` + `forbidNonWhitelisted`).

## 8. Ошибки и edge cases
- Запрос без access token -> `401 Unauthorized`.
- Проект не найден -> `404 Not Found`.
- Пользователь не состоит в проекте -> `403 Forbidden`.
- Задача не найдена в указанном проекте -> `404 Not Found`.
- `assignee_id` не существует -> `404 Not Found`.
- `assignee_id` не состоит в проекте -> `400 Bad Request`.
- Проект не имеет стартового статуса для создания задачи -> `409 Conflict`.
- `status_id` не существует -> `404 Not Found`.
- `status_id` принадлежит другому проекту -> `400 Bad Request`.
- `sprint_id` не существует -> `404 Not Found`.
- `sprint_id` принадлежит другому проекту -> `400 Bad Request`.
- Sprint не принимает новые задачи по своему состоянию -> `409 Conflict`.
- Попытка сменить статус у задачи вне sprint/board-сценария -> `409 Conflict`.
- Попытка удалить задачу не автором и не владельцем проекта -> `403 Forbidden`.
- `target_index` больше длины списка -> задача переносится в конец списка.
- Отрицательный `target_index` -> `400 Bad Request`.
- Пустые или невалидные поля DTO -> `400 Bad Request`.
- Повторная операция без фактического изменения состояния должна завершаться успешно.

## 9. Критерии готовности
- Все endpoint'ы `issues` работают по контракту.
- Проверки принадлежности проекта, статуса, sprint и исполнителя соблюдаются.
- Права доступа к чтению, изменению и удалению задач реализованы по спецификации.
- Backlog и reorder-сценарии работают стабильно и предсказуемо.
- Написаны базовые unit-тесты сервиса `issues`.
- Написаны e2e-тесты happy-path + ключевые ошибки доступа и валидации.
- Swagger-документация для `issues` актуальна и проверена вручную.

## 10. Зависимости модуля и заметки по архитектуре
### Минимальные интеграционные контракты

#### Контракт от `projects`
Модуль `issues` должен уметь:
- проверить, что проект существует;
- проверить, что пользователь является участником проекта;
- определить, является ли пользователь владельцем проекта;
- при необходимости убедиться, что проект доступен для работы с задачами.

Почему это нужно:
- все операции `issues` происходят внутри проекта;
- право на удаление задачи зависит от роли владельца проекта;
- нельзя создавать и читать задачи вне доступного проекта.

#### Контракт от `statuses`
Модуль `issues` должен уметь:
- получить стартовый статус проекта для создания новой задачи;
- проверить, что целевой статус существует;
- проверить, что целевой статус принадлежит нужному проекту;
- при board-операциях понимать, что статус допустим для движения задачи.

Почему это нужно:
- задача всегда должна иметь валидный `status_id`;
- board-перемещение не может уводить задачу в колонку другого проекта;
- создание задачи требует стартовой колонки проекта.

#### Контракт от `issue_types`
Модуль `issues` должен уметь:
- разрешить публичный тип `task | bug` в реальный `type_id`;
- маппить `issue_types.code` обратно в API-поле `type_code`.

Почему это нужно:
- БД хранит тип задачи не enum-полем в `issues`, а через lookup-таблицу `issue_types`;
- публичный API модуля `issues` при этом остается совместимым с lookup-таблицей и удобным для фронтенда.

#### Контракт от `sprints`
Модуль `issues` должен уметь:
- проверить, что sprint существует;
- проверить, что sprint принадлежит нужному проекту;
- проверить, что sprint допускает добавление / удаление задач;
- для board-сценариев понимать, что задача находится в корректном sprint-контексте.

Почему это нужно:
- перенос задачи между backlog и sprint должен быть валидным;
- board-сценарии невозможны без корректного sprint-контекста;
- модуль `issues` не должен сам владеть жизненным циклом sprint.

### Заметки по архитектуре
- Разделить уровни:
  - `IssuesController` — HTTP-вход.
  - `IssuesService` — бизнес-логика задач.
  - `IssuesRepository` — доступ к данным по `issues`, если Prisma-запросы разрастаются.
- Не смешивать в `IssuesService` реализацию соседних модулей `projects`, `statuses`, `sprints`.
- Зависимости между модулями оформлять через публичные сервисы / контракты, а не через прямой доступ к внутренним файлам соседнего модуля.
- Логику перестановки позиций лучше держать в одном месте, чтобы одинаково обрабатывать backlog и board.
