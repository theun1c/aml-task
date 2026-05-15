# 🎯 FRONTEND API FLOWS: Диаграммы основных сценариев

Визуальные диаграммы всех основных пользовательских потоков и соответствующих API вызовов.

---

## 1️⃣ Сценарий: Первый запуск приложения

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant Backend as 🖥️ Backend
    participant DB as 💾 Database

    User->>Frontend: Open app
    Frontend->>Backend: GET /users/me
    Backend->>DB: Query user by token
    alt User exists
        Backend-->>Frontend: 200 + user data
        Frontend->>Frontend: Save user to state
        Frontend->>Backend: GET /projects
        Backend->>DB: Query user's projects
        Backend-->>Frontend: 200 + [projects]
        Frontend->>Frontend: Display projects list
        Frontend->>User: Show dashboard
    else Token expired
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Backend: POST /auth/refresh
        Backend->>DB: Validate refresh token
        Backend-->>Frontend: New access_token
        Frontend->>Frontend: Retry GET /users/me
    end
```

---

## 2️⃣ Сценарий: Просмотр Kanban доски

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant Backend as 🖥️ Backend
    participant Cache as 📦 Redis Cache

    User->>Frontend: Click project
    Frontend->>Backend: GET /projects/{projectId}
    Backend->>Cache: Check if project cached
    alt Cache hit
        Cache-->>Backend: Return cached data
    else Cache miss
        Backend->>Backend: Query project + members
        Backend->>Cache: Store in Redis (10 min TTL)
    end
    Backend-->>Frontend: 200 + project data

    Frontend->>Backend: GET /projects/{projectId}/statuses
    Backend-->>Frontend: [status-1, status-2, status-3]
    
    Frontend->>Backend: GET /projects/{projectId}/sprints/active/issues
    Backend-->>Frontend: [issues] + [statuses]

    Frontend->>Frontend: Render Kanban board
    Frontend->>Frontend: To Do | In Progress | Done
    Frontend->>User: Show board ready
```

---

## 3️⃣ Сценарий: Drag-n-Drop задачи между колонками ⭐ ВАЖНО

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant Backend as 🖥️ Backend
    participant DB as 💾 Database

    User->>Frontend: Drag card from "To Do" to "In Progress"
    
    Frontend->>Frontend: 1. Calculate new position (e.g., 1500)
    Frontend->>Frontend: 2. Update UI optimistically
    Frontend->>Frontend: Show card in new column
    
    Frontend->>Backend: PATCH /projects/{id}/issues/{id}/move
    Note over Frontend,Backend: { status_id: status-2, rank_position: 1500 }
    
    Backend->>DB: Update issue status + position
    Backend->>Backend: Publish event: ISSUE_UPDATED
    Backend-->>Frontend: 200 + updated issue
    
    alt Success
        Frontend->>Frontend: Keep UI as is (already updated)
        Frontend->>User: ✅ Done
    else Error
        Frontend->>Frontend: Revert UI to original
        Frontend->>User: ❌ Show error message
    end
```

---

## 4️⃣ Сценарий: Планирование спринта (Sprint Planning)

```mermaid
graph TD
    A["👤 User opens Sprint Planning"] -->|GET /projects/{id}/sprints| B["📋 Load all sprints"]
    B --> C["Choose Sprint or Create New"]
    
    C -->|POST /projects/{id}/sprints| D["✨ Create Sprint"]
    D -->|sprintId| E["📌 Sprint created"]
    
    E -->|GET /projects/{id}/issues<br/>status_category=backlog| F["📊 Load Backlog"]
    F -->|Show 2-column view| G["Left: Backlog<br/>Right: Sprint"]
    
    G -->|User drags issue| H{"Drag-n-Drop"}
    H -->|Drop in sprint| I["PATCH /projects/{id}/issues/{id}"]
    I -->|sprint_id: sprint-123| J["Issue moved to sprint"]
    
    J -->|When ready| K["PATCH /projects/{id}/sprints/{id}/start"]
    K -->|is_active: true| L["🚀 Sprint started!"]
    L -->|GET /sprints/{id}/active/issues| M["Load Kanban board"]
```

---

## 5️⃣ Сценарий: Создание задачи в Backlog

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant Backend as 🖥️ Backend
    participant Logger as 📝 Pino Logger
    participant Queue as 📬 RabbitMQ

    User->>Frontend: Click "New Issue"
    Frontend->>User: Show modal form
    
    User->>Frontend: Fill: title, type, assignee
    User->>Frontend: Click "Create"
    
    Frontend->>Backend: POST /projects/{id}/issues
    Note over Frontend,Backend: { title, type_code, assignee_id }
    
    Backend->>Logger: Log "Creating issue..."
    Backend->>Backend: Validate access
    Backend->>Backend: Generate issue_number (#1, #2...)
    Backend->>Backend: Set initial position
    Backend->>Backend: Create in DB
    
    Backend->>Logger: Log "Issue created successfully"
    Backend->>Queue: Publish ISSUE_CREATED event
    Queue->>Queue: Event queued for workers
    
    Backend-->>Frontend: 201 + { id, issue_number, ... }
    Frontend->>Frontend: Add to list
    Frontend->>User: ✅ Show success
    Frontend->>Frontend: Close modal
```

---

## 6️⃣ Сценарий: Завершение спринта

```mermaid
graph TD
    A["👤 User in Kanban board"] -->|Click 'Complete Sprint'| B["⚠️ Show confirmation dialog"]
    B -->|"Are you sure?<br/>Unfinished tasks → Backlog"| C{User confirms?}
    
    C -->|Cancel| D["✋ Nothing happens"]
    
    C -->|Confirm| E["PATCH /projects/{id}/sprints/{id}/complete"]
    E -->|Backend:| F["Finish sprint"]
    F -->|Return unfinished| G["Move to Backlog"]
    G -->|Response:| H["{ returned_to_backlog: 3 }"]
    
    H -->|Frontend:| I["Update UI"]
    I -->|1. Hide Kanban| J["Kanban removed"]
    I -->|2. Show Backlog| K["Add 3 new issues to Backlog"]
    I -->|3. Update sprint list| L["Mark as completed"]
    
    K -->|Show message| M["✅ Sprint completed!<br/>3 issues returned"]
```

---

## 7️⃣ Сценарий: Добавление комментария к задаче

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant Backend as 🖥️ Backend
    participant Queue as 📬 RabbitMQ

    User->>Frontend: Open issue details
    Frontend->>Backend: GET /projects/{id}/issues/{id}/comments
    Backend-->>Frontend: [comments]
    Frontend->>Frontend: Display comments
    
    User->>Frontend: Type comment
    User->>Frontend: Click "Send"
    
    Frontend->>Backend: POST /projects/{id}/issues/{id}/comments
    Note over Frontend,Backend: { text: "Need QA review" }
    
    Backend->>Backend: Create comment in DB
    Backend->>Queue: Publish COMMENT_ADDED event
    Backend-->>Frontend: 201 + { id, text, author, ... }
    
    Frontend->>Frontend: Add comment to list
    Frontend->>Frontend: Show author avatar
    Frontend->>Frontend: Clear input field
    Frontend->>User: ✅ Comment added
```

---

## 8️⃣ Сценарий: Переупорядочивание колонок

```mermaid
graph TD
    A["👤 Owner drags column header"] -->|Drag 'Testing' left| B["Calculate new position"]
    B -->|Old: 4, New: 2| C["PATCH /projects/{id}/statuses/{id}/reorder"]
    
    C -->|request:| D["{ position: 2 }"]
    D -->|Backend reorders| E["To Do | Testing | In Progress | Done"]
    
    E -->|Response:| F["{ position: 2 }"]
    F -->|Frontend:| G["Update columns order"]
    G -->|Redraw Kanban| H["Display in new order"]
    H -->|User sees| I["✅ Columns reordered"]
```

---

## 9️⃣ Сценарий: Создание проекта

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant Backend as 🖥️ Backend
    participant DB as 💾 Database

    User->>Frontend: Click "New Project"
    Frontend->>User: Show form
    
    User->>Frontend: Fill: name, key, description
    User->>Frontend: Click "Create"
    
    Frontend->>Backend: POST /projects
    Note over Frontend,Backend: { name, project_key, description }
    
    Backend->>DB: Create project
    Backend->>Backend: Set owner = current_user
    
    Backend->>DB: Create default statuses
    Note over Backend,DB: 1. To Do (pos 1)<br/>2. In Progress (pos 2)<br/>3. Done (pos 3)
    
    Backend->>Backend: Create project_member (owner role)
    Backend-->>Frontend: 201 + project + statuses
    
    Frontend->>Frontend: Save to state
    Frontend->>Frontend: Add to projects list
    Frontend->>Frontend: Redirect to project
    Frontend->>User: ✅ Project created!
```

---

## 🔟 Сценарий: Обработка ошибок (401 - Token Expired)

```mermaid
graph TD
    A["Frontend sends request"] -->|any endpoint| B["Backend receives"]
    B -->|No valid token| C["Return 401 Unauthorized"]
    
    C -->|Frontend catches| D["Check if refresh_token exists"]
    D -->|Yes| E["POST /auth/refresh"]
    E -->|with refresh_token| F["Backend validates"]
    
    F -->|Valid| G["Return new access_token"]
    G -->|Frontend stores| H["Update localStorage"]
    H -->|Retry| I["Resend original request"]
    I -->|with new token| J["✅ Success"]
    
    F -->|Invalid| K["Return 401"]
    K -->|Frontend| L["Clear tokens"]
    L -->|Redirect| M["🔓 Go to login page"]
```

---

## 📊 Матрица: Действие → Endpoint

### Категория: ISSUES (Задачи)

| Действие | Endpoint | Метод | Flow |
|----------|----------|-------|------|
| **Создать задачу** | `/projects/{id}/issues` | POST | [Сценарий 5️⃣](#5️⃣-сценарий-создание-задачи-в-backlog) |
| **Переместить между колонками** | `/projects/{id}/issues/{id}/move` | PATCH | [Сценарий 3️⃣](#3️⃣-сценарий-dragndrop-задачи-между-колонками--важно) |
| **Добавить в спринт** | `/projects/{id}/issues/{id}` | PATCH | [Сценарий 4️⃣](#4️⃣-сценарий-планирование-спринта-sprint-planning) |
| **Загрузить backlog** | `/projects/{id}/issues?status_category=backlog` | GET | [Сценарий 4️⃣](#4️⃣-сценарий-планирование-спринта-sprint-planning) |
| **Загрузить для Kanban** | `/projects/{id}/sprints/active/issues` | GET | [Сценарий 2️⃣](#2️⃣-сценарий-просмотр-kanban-доски) |

### Категория: SPRINTS (Спринты)

| Действие | Endpoint | Метод | Flow |
|----------|----------|-------|------|
| **Создать спринт** | `/projects/{id}/sprints` | POST | [Сценарий 4️⃣](#4️⃣-сценарий-планирование-спринта-sprint-planning) |
| **Запустить спринт** | `/projects/{id}/sprints/{id}/start` | PATCH | [Сценарий 4️⃣](#4️⃣-сценарий-планирование-спринта-sprint-planning) |
| **Завершить спринт** | `/projects/{id}/sprints/{id}/complete` | PATCH | [Сценарий 6️⃣](#6️⃣-сценарий-завершение-спринта) |
| **Загрузить список** | `/projects/{id}/sprints` | GET | [Сценарий 4️⃣](#4️⃣-сценарий-планирование-спринта-sprint-planning) |

### Категория: STATUSES (Колонки)

| Действие | Endpoint | Метод | Flow |
|----------|----------|-------|------|
| **Создать колонку** | `/projects/{id}/statuses` | POST | Создание |
| **Загрузить все** | `/projects/{id}/statuses` | GET | [Сценарий 2️⃣](#2️⃣-сценарий-просмотр-kanban-доски) |
| **Переупорядочить** | `/projects/{id}/statuses/{id}/reorder` | PATCH | [Сценарий 8️⃣](#8️⃣-сценарий-переупорядочивание-колонок) |

### Категория: COMMENTS (Комментарии)

| Действие | Endpoint | Метод | Flow |
|----------|----------|-------|------|
| **Добавить** | `/projects/{id}/issues/{id}/comments` | POST | [Сценарий 7️⃣](#7️⃣-сценарий-добавление-комментария-к-задаче) |
| **Загрузить** | `/projects/{id}/issues/{id}/comments` | GET | [Сценарий 7️⃣](#7️⃣-сценарий-добавление-комментария-к-задаче) |

### Категория: PROJECTS (Проекты)

| Действие | Endpoint | Метод | Flow |
|----------|----------|-------|------|
| **Создать** | `/projects` | POST | [Сценарий 9️⃣](#9️⃣-сценарий-создание-проекта) |
| **Загрузить список** | `/projects` | GET | [Сценарий 1️⃣](#1️⃣-сценарий-первый-запуск-приложения) |
| **Загрузить детали** | `/projects/{id}` | GET | [Сценарий 2️⃣](#2️⃣-сценарий-просмотр-kanban-доски) |

---

## 🎓 Как читать диаграммы

### Sequencediagram (Последовательность)
- 👤 User = пользователь
- 🎨 Frontend = React приложение
- 🖥️ Backend = NestJS сервер
- 💾 Database = PostgreSQL
- 📬 RabbitMQ = очередь событий
- 📝 Logger = Pino логирование

**Стрелки:**
- → = синхронный запрос
- ← = ответ
- ⟿ = асинхронный процесс

### Graph (Граф)
- A →| text | B = переход с условием
- { } = условный выбор (if-else)
- [[ ]] = результат

---

## 💡 Ключевые закономерности

### 1. Все GET запросы для статических данных кешируются
```
GET /projects/{id}
→ Cache hit: 15ms
→ Cache miss: 200ms
→ Cached for 10 minutes
```

### 2. Все CREATE/UPDATE/DELETE публикуют события
```
POST /issues
→ Backend логирует
→ Backend публикует в RabbitMQ
→ API ответила уже (не ждет)
```

### 3. Большинство операций требуют проверки доступа
```
PATCH /projects/{id}
→ Проверка: user is project member/owner
→ Если нет: 403 Forbidden
```

### 4. Архивированные проекты read-only
```
PATCH /archived-project
→ 409 Conflict
→ "Project is archived - read-only mode"
```

---

## 🔍 Как использовать эти диаграммы

1. **Фронтендеру:** Откройте нужный сценарий, посмотрите какой endpoint нужно вызвать
2. **Бэкендеру:** Используйте как спецификацию того, что нужно поддерживать
3. **Тестировщику:** Используйте как checklist для тестирования
4. **Новому разработчику:** Изучайте систему через сценарии

---

**Версия:** 1.0  
**Дата:** May 14, 2026  
**Формат:** Markdown + Mermaid Diagrams  
**Инструменты для просмотра:** GitHub, VS Code + Markdown Preview
