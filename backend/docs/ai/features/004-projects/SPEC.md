# SPEC.md
# Фича: projects

## Цель
Дать MVP-контракт для проектов и участников проекта, согласованный с текущим кодом и правилами архивации.

## Текущий backend-контракт
- `POST /projects`
- `GET /projects`
- `GET /projects/:project_id`
- `PATCH /projects/:project_id`
- `DELETE /projects/:project_id` — архивирует проект
- `GET /projects/:project_id/members`
- `POST /projects/:project_id/members`
- `DELETE /projects/:project_id/members/:user_id`

## Бизнес-правила
- у проекта есть owner;
- при создании проекта создаются дефолтные статусы `To Do / In Progress / Done`;
- участники добавляются по `email`, а не по `user_id`;
- архивированный проект остается видимым участникам, но все project-scoped mutation endpoint'ы становятся read-only и отвечают `409 Conflict`;
- повторный archive допустим как no-op.

## Что уже закрыто
- архивирование отделено от soft-delete;
- добавление участника переведено на `email`;
- read-only семантика архива раскатана на `projects`, `project-members`, `issues`, `sprints`, `statuses`, `comments`.

## Ограничения MVP
- нет transfer ownership;
- нет invite-flow и pending invitations;
- нет отдельного delete/permanent-delete API.
