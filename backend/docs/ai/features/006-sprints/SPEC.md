# SPEC.md
# Фича: sprints

## Цель
Дать MVP-контракт для жизненного цикла спринта и базового sprint planning.

## Текущий backend-контракт
- `POST /projects/:project_id/sprints`
- `GET /projects/:project_id/sprints`
- `GET /projects/:project_id/sprints/active`
- `GET /projects/:project_id/sprints/:sprint_id`
- `PATCH /projects/:project_id/sprints/:sprint_id`
- `DELETE /projects/:project_id/sprints/:sprint_id`
- `PATCH /projects/:project_id/sprints/:sprint_id/start`
- `PATCH /projects/:project_id/sprints/:sprint_id/complete`

## Бизнес-правила
- у проекта может быть только один active sprint;
- запуск доступен только для planned sprint, в котором есть хотя бы одна задача;
- завершение active sprint возвращает незавершенные задачи в backlog;
- удаление planned sprint возвращает все его задачи в backlog;
- archived project не допускает sprint mutations;
- диапазон дат валидируется: `start_date <= end_date`.

## Что уже закрыто
- добавлены read/get/update/delete для planned sprint;
- `start` запрещает пустой sprint;
- `complete` детерминированно возвращает незавершенные задачи в backlog;
- есть unit и e2e покрытие новых endpoint'ов.

## Ограничения MVP
- пока нет отдельного endpoint'а списка задач конкретного sprint;
- board read API по активному sprint пока собирается через соседние модули;
- нет burndown, авто-complete по дате и прочего post-MVP.
