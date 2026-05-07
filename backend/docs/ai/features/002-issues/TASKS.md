# TASKS.md

# Фича: issues

## Статус

- [x] planned
- [x] in progress
- [ ] done

## 1. Подготовка

- [ ] Уточнить финальный контракт ответов для `create/get/update/delete/backlog/sprint/status/position`.
- [ ] Зафиксировать стратегию стартового статуса для новой задачи.
- [ ] Зафиксировать стратегию перестановки `position` для backlog и board.
- [ ] Уточнить правило прав на удаление задачи: автор или владелец проекта.
- [x] Зафиксировать минимальные интеграционные контракты от `projects`, `statuses`, `sprints`, `issue_types`.

## 2. Изменения в БД

- [x] Зафиксировать, что источник истины для схемы — существующая БД и интроспектированная Prisma schema.
- [x] Описать модель `issues` c полями `issue_number`, `reporter_id`, `type_id`, `rank_position`.
- [x] Зафиксировать связи `issues -> projects/statuses/sprints/users/issue_types`.
- [x] Зафиксировать индексы для backlog/board reorder-сценариев.
- [ ] Описать стратегию миграций поверх уже существующей БД без расхождения со схемой.

## 3. Модули / структура

- [ ] Создать модуль `issues`.
- [ ] Создать базовую структуру `controllers / services / dto / responses`.
- [x] Определить, нужен ли `IssuesRepository` сразу или Prisma можно оставить внутри сервиса на первом шаге.
- [x] Подготовить публичные зависимости модуля от `projects`, `statuses`, `sprints`, `issue_types`.

## 4. DTO и валидация

- [x] `CreateIssueDto`: `title`, `description`, `type_code`, `assignee_id`.
- [x] `UpdateIssueDto`: частичное обновление `title`, `description`, `type_code`, `assignee_id`.
- [x] `MoveIssueToSprintDto`: `sprint_id` (`uuid | null`).
- [x] `ChangeIssueStatusDto`: `status_id`.
- [x] `ReorderIssueDto`: `target_index`.
- [ ] Проверить `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- [ ] Нормализовать и `trim` строковые поля.

## 5. Бизнес-логика

- [ ] Проверка существования проекта и доступа пользователя к проекту.
- [ ] Проверка стартового статуса проекта при создании задачи.
- [x] Создание задачи в конце backlog с корректным `status_id`.
- [ ] Получение задачи по `project_id + issue_id`.
- [ ] Обновление полей задачи.
- [ ] Проверка валидности `assignee_id` и его принадлежности проекту.
- [ ] Удаление задачи с проверкой прав.
- [x] Получение backlog задач проекта в правильном порядке.
- [ ] Перенос задачи в sprint и возврат задачи в backlog.
- [ ] Смена `status_id` на board.
- [x] Перестановка задачи по `target_index` с корректным пересчетом позиций через `rank_position`.
- [ ] Обработка no-op сценариев без ошибок.

## 6. Контроллеры / API

- [x] `POST /projects/:project_id/issues`.
- [x] `GET /projects/:project_id/issues/:issue_id`.
- [x] `PATCH /projects/:project_id/issues/:issue_id`.
- [x] `DELETE /projects/:project_id/issues/:issue_id`.
- [x] `GET /projects/:project_id/issues/backlog`.
- [x] `POST /projects/:project_id/issues/:issue_id/sprint`.
- [x] `PATCH /projects/:project_id/issues/:issue_id/status`.
- [x] `PATCH /projects/:project_id/issues/:issue_id/position`.
- [ ] Привести HTTP-коды к контракту (`201/200/400/401/403/404/409`).

## 6.1 Swagger / OpenAPI

- [ ] Добавить теги и краткие описания операций для всех `issues` endpoint'ов.
- [ ] Описать request/response DTO для всех endpoint'ов модуля.
- [ ] Описать основные коды ответов (`200/201/400/401/403/404/409` где применимо).
- [x] Описать enum `IssueType` в Swagger.
- [ ] Пометить все endpoint'ы `issues` как защищенные bearer auth.

## 7. Права доступа / security

- [ ] Закрыть все endpoint'ы `issues` JWT-аутентификацией.
- [x] Проверять членство пользователя в проекте на всех операциях.
- [ ] Разрешить удаление только автору задачи или владельцу проекта.
- [ ] Не позволять назначать исполнителем пользователя вне проекта.
- [ ] Не позволять менять `status_id` и `sprint_id` на сущности другого проекта.

## 8. Тестирование

- [x] Добавить regression-тесты на schema-mapping (`issue_types.code`, `reporter_id`, `rank_position`).
- [ ] Unit-тесты для `IssuesService` на create/get/update/delete.
- [ ] Unit-тесты на backlog reorder / move / status.
- [ ] E2E happy-path для основных endpoint'ов.
- [ ] E2E негативные сценарии: `401/403/404/409/400`.

## 9. Ручная проверка

- [ ] Создать проект с базовыми статусами.
- [ ] Создать задачу в backlog через Swagger/Postman.
- [ ] Получить задачу по `issue_id`.
- [ ] Обновить задачу и проверить изменения.
- [ ] Проверить назначение исполнителя из состава проекта.
- [ ] Перенести задачу в sprint и вернуть обратно в backlog.
- [ ] Проверить смену статуса на board.
- [ ] Проверить изменение позиции drag-n-drop сценария.
- [ ] Проверить запрет удаления задачи посторонним участником.

## 10. Definition of Done

- [ ] Все endpoint'ы `issues` соответствуют `SPEC.md`.
- [ ] Бизнес-правила и проверки доступа покрыты тестами.
- [ ] Backlog / sprint / board-сценарии работают стабильно.
- [ ] Swagger-документация `issues` полная и соответствует фактическому API.
- [ ] Документация фичи актуальна и согласована с `CONTEXT.md` и `TECH_SPEC.md`.
