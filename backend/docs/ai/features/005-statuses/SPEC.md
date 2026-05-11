# SPEC.md
# Фича: statuses

## Цель
Дать MVP-контракт для колонок проекта и правил board/backlog.

## Текущий backend-контракт
- `GET /projects/:project_id/statuses`
- `POST /projects/:project_id/statuses`
- `PATCH /projects/:project_id/statuses/:status_id`
- `DELETE /projects/:project_id/statuses/:status_id`

## Бизнес-правила
- статус принадлежит проекту;
- управлять статусами может только owner проекта;
- удаление статуса переносит его задачи в первую оставшуюся колонку;
- порядок колонок перестраивается транзакционно;
- archived project не допускает мутаций статусов;
- route params валидируются как UUID.

## Что уже закрыто
- delete/reorder синхронизированы с ТЗ;
- DTO `name` trim-ится и не принимает whitespace-only значения;
- есть unit coverage на reorder/delete и DTO validation.

## Ограничения MVP
- создание статуса все еще использует `last position + 1`, поэтому race-risk при параллельном create остается;
- нет отдельного bulk API для массового редактирования колонок.
