# TASKS.md

# Фича: issues

## Статус

- [x] planned
- [ ] in progress
- [ ] done

## 1. Подготовка

- [ ] Уточнить финальный контракт ответов для `create/get/update/delete/backlog/sprint/status/position`.
- [ ] Зафиксировать стратегию стартового статуса для новой задачи.
- [ ] Зафиксировать стратегию перестановки `position` для backlog и board.
- [ ] Уточнить правило прав на удаление задачи: автор или владелец проекта.
- [ ] Зафиксировать минимальные интеграционные контракты от `projects`, `statuses`, `sprints`.

## 2. Изменения в БД

- [ ] Добавить enum `IssueType` со значениями `task` и `bug`.
- [ ] Описать модель `issues` в Prisma schema.
- [ ] Добавить связи `issues -> projects`, `issues -> statuses`, `issues -> sprints`, `issues -> users`.
- [ ] Добавить индексы для backlog/board reorder-сценариев.
- [ ] Создать и применить миграцию Prisma для `issues`.

## 3. Модули / структура

- [ ] Создать модуль `issues`.
- [ ] Создать базовую структуру `controllers / services / dto / responses`.
- [ ] Определить, нужен ли `IssuesRepository` сразу или Prisma можно оставить внутри сервиса на первом шаге.
- [ ] Подготовить публичные зависимости модуля от `projects`, `statuses`, `sprints`.

## 4. DTO и валидация

- [ ] `CreateIssueDto`: `title`, `description`, `type`, `assigneeId`.
- [ ] `UpdateIssueDto`: частичное обновление `title`, `description`, `type`, `assigneeId`.
- [ ] `MoveIssueToSprintDto`: `sprintId` (`uuid | null`).
- [ ] `ChangeIssueStatusDto`: `statusId`.
- [ ] `ReorderIssueDto`: `targetIndex`.
- [ ] Проверить `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- [ ] Нормализовать и `trim` строковые поля.

## 5. Бизнес-логика

- [ ] Проверка существования проекта и доступа пользователя к проекту.
- [ ] Проверка стартового статуса проекта при создании задачи.
- [ ] Создание задачи в конце backlog с корректным `statusId`.
- [ ] Получение задачи по `projectId + issueId`.
- [ ] Обновление полей задачи.
- [ ] Проверка валидности `assigneeId` и его принадлежности проекту.
- [ ] Удаление задачи с проверкой прав.
- [ ] Получение backlog задач проекта в правильном порядке.
- [ ] Перенос задачи в sprint и возврат задачи в backlog.
- [ ] Смена `statusId` на board.
- [ ] Перестановка задачи по `targetIndex` с корректным пересчетом позиций.
- [ ] Обработка no-op сценариев без ошибок.

## 6. Контроллеры / API

- [ ] `POST /projects/:projectId/issues`.
- [ ] `GET /projects/:projectId/issues/:issueId`.
- [ ] `PATCH /projects/:projectId/issues/:issueId`.
- [ ] `DELETE /projects/:projectId/issues/:issueId`.
- [ ] `GET /projects/:projectId/issues/backlog`.
- [ ] `POST /projects/:projectId/issues/:issueId/sprint`.
- [ ] `PATCH /projects/:projectId/issues/:issueId/status`.
- [ ] `PATCH /projects/:projectId/issues/:issueId/position`.
- [ ] Привести HTTP-коды к контракту (`201/200/400/401/403/404/409`).

## 6.1 Swagger / OpenAPI

- [ ] Добавить теги и краткие описания операций для всех `issues` endpoint'ов.
- [ ] Описать request/response DTO для всех endpoint'ов модуля.
- [ ] Описать основные коды ответов (`200/201/400/401/403/404/409` где применимо).
- [ ] Описать enum `IssueType` в Swagger.
- [ ] Пометить все endpoint'ы `issues` как защищенные bearer auth.

## 7. Права доступа / security

- [ ] Закрыть все endpoint'ы `issues` JWT-аутентификацией.
- [ ] Проверять членство пользователя в проекте на всех операциях.
- [ ] Разрешить удаление только автору задачи или владельцу проекта.
- [ ] Не позволять назначать исполнителем пользователя вне проекта.
- [ ] Не позволять менять `statusId` и `sprintId` на сущности другого проекта.

## 8. Тестирование

- [ ] Unit-тесты для `IssuesService` на create/get/update/delete.
- [ ] Unit-тесты на backlog reorder.
- [ ] Unit-тесты на перенос задачи между backlog и sprint.
- [ ] Unit-тесты на смену статуса и проверки принадлежности проекта.
- [ ] E2E happy-path для основных endpoint'ов.
- [ ] E2E негативные сценарии: `401/403/404/409/400`.

## 9. Ручная проверка

- [ ] Создать проект с базовыми статусами.
- [ ] Создать задачу в backlog через Swagger/Postman.
- [ ] Получить задачу по `issueId`.
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
