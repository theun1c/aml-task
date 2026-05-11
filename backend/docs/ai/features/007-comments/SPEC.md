# SPEC.md
# Фича: comments

## Цель
Дать MVP-контракт для обсуждений внутри issue.

## Текущий backend-контракт
- `POST /projects/:project_id/issues/:issue_id/comments`
- `GET /projects/:project_id/issues/:issue_id/comments`
- `PATCH /projects/:project_id/issues/:issue_id/comments/:comment_id`
- `DELETE /projects/:project_id/issues/:issue_id/comments/:comment_id`

## Бизнес-правила
- комментарий принадлежит issue и автору;
- читать комментарии может участник проекта;
- редактировать и удалять может только автор комментария;
- content trim-ится и whitespace-only значения невалидны;
- archived project не допускает comment mutations;
- route params валидируются как UUID.

## Что уже закрыто
- trim и whitespace validation есть и на DTO, и на сервисном уровне;
- авторские проверки на update/delete сохранены;
- controller выровнен по `ApiConflictResponse` и `ParseUUIDPipe`.

## Ограничения MVP
- delete остается soft-delete;
- нет истории редактирования комментариев;
- нет mention/notification flow.
