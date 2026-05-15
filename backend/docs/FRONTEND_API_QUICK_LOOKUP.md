# ⚡ FRONTEND API QUICK LOOKUP

**Для фронтендера:** Быстро найти нужный endpoint - используйте эту таблицу!

---

## 🎯 ПО ДЕЙСТВИЯМ ПОЛЬЗОВАТЕЛЯ

### 🔐 Аутентификация

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Нажимает "Sign Up" | `POST /auth/register` | POST | 201 |
| Нажимает "Login" | `POST /auth/login` | POST | 200 |
| Токен истек | `POST /auth/refresh` | POST | 200 |
| Нажимает "Logout" | `POST /auth/logout` | POST | 200 |

### 👤 Профиль

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Страница загружается | `GET /users/me` | GET | 200 |
| Редактирует профиль | `PATCH /users/{id}` | PATCH | 200 |
| Нужна информация о всех пользователях | `GET /users?limit=50` | GET | 200 |

### 📦 Проекты

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Открывает список проектов | `GET /projects?limit=50` | GET | 200 |
| Нажимает "New Project" | `POST /projects` | POST | 201 |
| Открывает проект | `GET /projects/{projectId}` | GET | 200 |
| Редактирует проект | `PATCH /projects/{projectId}` | PATCH | 200 |
| Архивирует проект | `PATCH /projects/{projectId}/archive` | PATCH | 200 |

### 🏃 Спринты

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Открывает Sprint Planning | `GET /projects/{id}/sprints` | GET | 200 |
| Нажимает "New Sprint" | `POST /projects/{id}/sprints` | POST | 201 |
| Нажимает "Start Sprint" | `PATCH /projects/{id}/sprints/{id}/start` | PATCH | 200 |
| Нажимает "Complete Sprint" | `PATCH /projects/{id}/sprints/{id}/complete` | PATCH | 200 |

### 🎨 Колонки (Statuses)

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Загружает Kanban | `GET /projects/{id}/statuses` | GET | 200 |
| Нажимает "Add Column" | `POST /projects/{id}/statuses` | POST | 201 |
| Редактирует колонку | `PATCH /projects/{id}/statuses/{id}` | PATCH | 200 |
| Перетаскивает колонку | `PATCH /projects/{id}/statuses/{id}/reorder` | PATCH | 200 |
| Удаляет колонку | `DELETE /projects/{id}/statuses/{id}` | DELETE | 204 |

### 📌 Задачи (Issues) ⭐ ГЛАВНОЕ

| Действие пользователя | Endpoint | Метод | Статус | Комментарий |
|---|---|---|---|---|
| **Открывает Kanban** | `GET /projects/{id}/sprints/active/issues` | GET | 200 | Получить задачи + статусы |
| **Открывает Backlog** | `GET /projects/{id}/issues?status_category=backlog` | GET | 200 | Все задачи в backlog'е |
| **Создает задачу** | `POST /projects/{id}/issues` | POST | 201 | title, type_code, assignee |
| **Перетаскивает между колонками** ⭐ | `PATCH /projects/{id}/issues/{id}/move` | PATCH | 200 | **САМОЕ ВАЖНОЕ** |
| **Перетаскивает в спринт** | `PATCH /projects/{id}/issues/{id}` | PATCH | 200 | sprint_id |
| **Редактирует задачу** | `PATCH /projects/{id}/issues/{id}` | PATCH | 200 | title, description, assignee |
| **Открывает детали** | `GET /projects/{id}/issues/{id}` | GET | 200 | Полная информация |
| **Удаляет задачу** | `DELETE /projects/{id}/issues/{id}` | DELETE | 204 | С подтверждением |

### 💬 Комментарии

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Открывает задачу | `GET /projects/{id}/issues/{id}/comments` | GET | 200 |
| Добавляет комментарий | `POST /projects/{id}/issues/{id}/comments` | POST | 201 |
| Удаляет комментарий | `DELETE /projects/{id}/issues/{id}/comments/{id}` | DELETE | 204 |

### 👥 Участники

| Действие пользователя | Endpoint | Метод | Статус |
|---|---|---|---|
| Открывает список участников | `GET /projects/{id}/members` | GET | 200 |
| Добавляет участника | `POST /projects/{id}/members` | POST | 201 |
| Удаляет участника | `DELETE /projects/{id}/members/{id}` | DELETE | 204 |

---

## 🔍 ПОИСК ПО ENDPOINT'У

### POST endpoints

```
POST /auth/register            ← Register new user
POST /auth/login               ← User login
POST /auth/refresh             ← Refresh token
POST /auth/logout              ← User logout

POST /projects                 ← Create project
POST /projects/{id}/sprints    ← Create sprint
POST /projects/{id}/statuses   ← Create column
POST /projects/{id}/issues     ← Create issue
POST /projects/{id}/issues/{id}/comments ← Add comment
POST /projects/{id}/members    ← Add member to project
```

### GET endpoints

```
GET /users/me                  ← Current user info
GET /users                     ← All users (with limit/offset)
GET /projects                  ← User's projects
GET /projects/{id}             ← Project details
GET /projects/{id}/statuses    ← All columns for Kanban
GET /projects/{id}/sprints     ← All sprints
GET /projects/{id}/issues      ← Backlog (+ filters)
GET /projects/{id}/sprints/active/issues ← Kanban issues
GET /projects/{id}/issues/{id}           ← Issue details
GET /projects/{id}/issues/{id}/comments  ← Issue comments
GET /projects/{id}/members     ← Project members
```

### PATCH endpoints

```
PATCH /users/{id}                      ← Edit profile
PATCH /projects/{id}                   ← Edit project
PATCH /projects/{id}/sprints/{id}/start    ← Start sprint
PATCH /projects/{id}/sprints/{id}/complete ← Complete sprint
PATCH /projects/{id}/statuses/{id}     ← Edit column
PATCH /projects/{id}/statuses/{id}/reorder ← Reorder column
PATCH /projects/{id}/issues/{id}       ← Edit issue
PATCH /projects/{id}/issues/{id}/move  ← Move to another column ⭐
```

### DELETE endpoints

```
DELETE /projects/{id}/statuses/{id}    ← Delete column
DELETE /projects/{id}/issues/{id}      ← Delete issue
DELETE /projects/{id}/issues/{id}/comments/{id} ← Delete comment
DELETE /projects/{id}/members/{id}     ← Remove member
```

---

## 🎬 ПО СЦЕНАРИЯМ

### Загрузка приложения (App Load)

```
1. GET /users/me
2. GET /projects
3. Show projects list
```

### Открытие проекта (Project Open)

```
1. GET /projects/{projectId}
2. GET /projects/{projectId}/statuses
```

### Просмотр Kanban (View Kanban)

```
1. GET /projects/{projectId}/sprints/active
2. GET /projects/{projectId}/sprints/active/issues
3. GET /projects/{projectId}/statuses
4. Render board
```

### Drag-n-Drop между колонками ⭐ ГЛАВНОЕ

```
1. PATCH /projects/{projectId}/issues/{issueId}/move
   Body: { status_id, rank_position }
2. Update UI
```

### Sprint Planning (Plan Sprint)

```
1. GET /projects/{id}/sprints
2. POST /projects/{id}/sprints (если создание)
3. GET /projects/{id}/issues?status_category=backlog
4. PATCH /projects/{id}/issues/{id} (добавить sprint_id)
5. PATCH /projects/{id}/sprints/{id}/start
```

### Создание проекта (Create Project)

```
1. POST /projects
2. Backend создает 3 default статуса
3. Redirect на страницу проекта
```

### Создание задачи (Create Issue)

```
1. POST /projects/{id}/issues
2. Add to list
3. Show success
```

### Завершение спринта (Complete Sprint)

```
1. Show confirmation dialog
2. PATCH /projects/{id}/sprints/{id}/complete
3. Backend возвращает незавершенные в Backlog
4. Update UI
```

---

## ⚠️ ВАЖНЫЕ ЗАПРОСЫ

### ⭐⭐⭐ САМЫЙ ВАЖНЫЙ ENDPOINT

```
PATCH /projects/{projectId}/issues/{issueId}/move
```

**Это используется для:** Drag-n-Drop между Kanban колонками

**Request body:**
```json
{
  "status_id": "status-2",
  "rank_position": 1500
}
```

**Как вычислить rank_position:**
- Если между двумя карточками: `(prev + next) / 2`
- Если в конец: `max_position + 100`

---

### ⭐⭐ ОЧЕНЬ ВАЖНЫЕ ENDPOINTS

```
GET /projects/{id}/sprints/active/issues     ← Load Kanban
POST /projects/{id}/sprints/{id}/start       ← Start sprint
PATCH /projects/{id}/sprints/{id}/complete   ← Complete sprint
POST /projects/{id}/issues                   ← Create issue
```

---

### ⭐ ВАЖНЫЕ ENDPOINTS

```
GET /projects                  ← Load projects list
POST /projects                 ← Create project
GET /projects/{id}/issues      ← Load backlog
POST /projects/{id}/sprints    ← Create sprint
```

---

## 🔄 КОДОВЫЕ ЦИКЛЫ (Request-Response)

### Типичный успешный цикл

```
1. Frontend: POST /projects/{id}/issues
2. Backend: 
   - Validate DTO
   - Create in DB
   - Log to Pino
   - Publish to RabbitMQ
   - Return 201 + issue data
3. Frontend:
   - Add to list
   - Show success notification
4. Done ✅
```

### Обработка ошибок

```
1. Frontend: PATCH /projects/archived/issues/{id}
2. Backend:
   - Check if project archived
   - Yes → Return 409 Conflict
   - Message: "Project is archived"
3. Frontend:
   - Catch 409
   - Show to user: "Project is read-only"
4. Done ❌ (but graceful)
```

---

## 📱 COMMON PATTERNS

### Optimistic Updates

```javascript
// 1. Update UI immediately
setIssues(prev => [...])

// 2. Send to server
try {
  await api.moveIssue(...)
} catch (error) {
  // 3. Revert if error
  setIssues(originalIssues)
}
```

### Paging

```
GET /projects?limit=50&offset=0    ← First 50
GET /projects?limit=50&offset=50   ← Next 50
GET /projects?limit=50&offset=100  ← Next 50
```

### Caching

```
GET /projects/{id}  (first time)   → 200ms (DB)
GET /projects/{id}  (within 10 min) → 15ms (Redis)
GET /projects/{id}  (after 10 min)  → 200ms (DB again)
```

---

## 🎓 ПРИМЕРЫ ЗАПРОСОВ

### 1. Создать задачу

```bash
curl -X POST http://localhost:3000/api/projects/proj-123/issues \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement auth",
    "type_code": "task",
    "assignee_id": "user-456"
  }'
```

### 2. Переместить задачу между колонками (DRAG-DROP)

```bash
curl -X PATCH http://localhost:3000/api/projects/proj-123/issues/issue-789/move \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status_id": "status-2",
    "rank_position": 1500
  }'
```

### 3. Загрузить задачи Kanban

```bash
curl -X GET http://localhost:3000/api/projects/proj-123/sprints/active/issues \
  -H "Authorization: Bearer {token}"
```

### 4. Запустить спринт

```bash
curl -X PATCH http://localhost:3000/api/projects/proj-123/sprints/sprint-1/start \
  -H "Authorization: Bearer {token}"
```

### 5. Добавить комментарий

```bash
curl -X POST http://localhost:3000/api/projects/proj-123/issues/issue-789/comments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This needs QA review"
  }'
```

---

## 🔗 ДОПОЛНИТЕЛЬНЫЕ ССЫЛКИ

- **Полная документация:** [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
- **Диаграммы потоков:** [FRONTEND_API_FLOWS.md](FRONTEND_API_FLOWS.md)
- **JSON Reference:** [FRONTEND_API_REFERENCE.json](FRONTEND_API_REFERENCE.json)
- **Swagger:** http://localhost:3000/api
- **Backend код:** `/backend/src/`

---

## 📋 ЛИСТ ДЛЯ ПЕЧАТИ

**Фронтендеру:** Распечатайте или добавьте закладку эту страницу!

### TOP 10 Most Used Endpoints

1. `GET /projects/{id}/sprints/active/issues` - Load Kanban
2. `PATCH /projects/{id}/issues/{id}/move` - Drag-drop ⭐
3. `GET /projects` - Load projects
4. `POST /projects/{id}/issues` - Create issue
5. `GET /projects/{id}/issues?status_category=backlog` - Load backlog
6. `GET /projects/{id}` - Load project
7. `POST /projects` - Create project
8. `PATCH /projects/{id}/sprints/{id}/start` - Start sprint
9. `POST /projects/{id}/sprints/{id}/complete` - Complete sprint
10. `POST /projects/{id}/issues/{id}/comments` - Add comment

---

**Версия:** 1.0  
**Статус:** Production Ready  
**Последнее обновление:** May 14, 2026
