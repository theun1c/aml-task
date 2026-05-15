# 🎯 FRONTEND API GUIDE: Когда какой endpoint вызывать

Этот документ описывает **когда и как** вызывать каждый API endpoint при конкретных действиях пользователя.

---

## 📋 СОДЕРЖАНИЕ

1. [Аутентификация](#аутентификация)
2. [Профиль пользователя](#профиль-пользователя)
3. [Проекты](#проекты)
4. [Участники проекта](#участники-проекта)
5. [Спринты](#спринты)
6. [Статусы (Колонки)](#статусы-колонки)
7. [Задачи (Issues)](#задачи-issues)
8. [Комментарии](#комментарии)
9. [Практические сценарии](#практические-сценарии)

---

## 🔐 АУТЕНТИФИКАЦИЯ

### Когда вызывать эти endpoints?

#### 📝 Регистрация нового пользователя

**Когда:** Пользователь нажимает кнопку "Sign Up" и заполняет форму

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Что делать:**
1. Сохранить `access_token` в localStorage/cookie
2. Сохранить `refresh_token` в secure cookie (httpOnly)
3. Редирект на `/dashboard`

---

#### 🔓 Вход в систему

**Когда:** Пользователь вводит email и пароль на странице Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Ответ:** То же что и регистрация

**Что делать:**
1. Сохранить токены
2. Редирект на `/dashboard`
3. Загрузить данные пользователя

---

#### 🔄 Обновление токена

**Когда:** 
- Access token скоро истекает (или истек)
- Получена 401 ошибка от API

```bash
POST /auth/refresh
Authorization: Bearer {refresh_token}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Что делать:**
1. Обновить токены в хранилище
2. Повторить исходный запрос

---

#### 🚪 Выход из системы

**Когда:** Пользователь нажимает "Logout"

```bash
POST /auth/logout
Authorization: Bearer {access_token}
```

**Что делать:**
1. Удалить токены из хранилища
2. Очистить local state
3. Редирект на `/login`

---

## 👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ

### 📖 Получить данные текущего пользователя

**Когда:** 
- Пользователь загружает страницу (получить info для header/sidebar)
- Открывает страницу профиля
- После login/register

```bash
GET /users/me
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2026-05-14T10:00:00Z"
}
```

---

### ✏️ Обновить профиль

**Когда:** Пользователь изменяет имя/аватар на странице профиля

```bash
PATCH /users/{userId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "avatar_url": "https://new-avatar.jpg"
}
```

---

### 🔍 Получить список всех пользователей

**Когда:** Нужно показать выпадающий список пользователей при:
- Добавлении участника в проект
- Назначении исполнителя на задачу
- Поиске пользователя

```bash
GET /users?limit=50&offset=0
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user1@example.com",
      "full_name": "User One"
    },
    {
      "id": "uuid",
      "email": "user2@example.com",
      "full_name": "User Two"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

## 📦 ПРОЕКТЫ

### ➕ Создать новый проект

**Когда:** Пользователь нажимает "New Project" и заполняет форму

```bash
POST /projects
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "project_key": "ECOM",
  "description": "Новая платформа электронной коммерции"
}
```

**Ответ:**
```json
{
  "id": "proj-123",
  "name": "E-Commerce Platform",
  "project_key": "ECOM",
  "description": "...",
  "owner_id": "user-123",
  "statuses": [
    {
      "id": "status-1",
      "name": "To Do",
      "position": 1,
      "color": "#6B7280"
    },
    {
      "id": "status-2",
      "name": "In Progress",
      "position": 2,
      "color": "#3B82F6"
    },
    {
      "id": "status-3",
      "name": "Done",
      "position": 3,
      "color": "#22C55E"
    }
  ],
  "created_at": "2026-05-14T10:00:00Z"
}
```

**Что делать:**
1. Обновить список проектов
2. Редирект на страницу проекта
3. Сохранить список статусов в state (нужны для Kanban)

---

### 📋 Получить список всех проектов пользователя

**Когда:**
- Загрузка страницы /projects или dashboard
- Нужно показать список проектов в боковой панели

```bash
GET /projects?limit=50&offset=0
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "proj-123",
      "name": "E-Commerce Platform",
      "project_key": "ECOM",
      "owner_id": "user-123",
      "is_archived": false,
      "created_at": "2026-05-14T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

### 🔍 Получить детали проекта

**Когда:** Пользователь открывает страницу проекта

```bash
GET /projects/{projectId}
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "id": "proj-123",
  "name": "E-Commerce Platform",
  "project_key": "ECOM",
  "description": "...",
  "owner_id": "user-123",
  "is_archived": false,
  "statuses": [...],
  "members": [...],
  "created_at": "2026-05-14T10:00:00Z"
}
```

**Что делать:**
1. Сохранить projectId в state
2. Показать основную информацию
3. Загрузить спринты и задачи
4. Скешировать данные (кеш на 10 минут)

---

### ✏️ Обновить проект

**Когда:** Владелец проекта редактирует название/описание

```bash
PATCH /projects/{projectId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "New Project Name",
  "description": "Updated description"
}
```

---

### 📦 Архивировать проект

**Когда:** Владелец нажимает "Archive Project"

```bash
PATCH /projects/{projectId}/archive
Authorization: Bearer {access_token}
```

**Важно:** После архивации проект становится read-only!

---

## 👥 УЧАСТНИКИ ПРОЕКТА

### ➕ Добавить участника в проект

**Когда:** 
- Владелец проекта нажимает "Add Member"
- Выбирает пользователя из списка

```bash
POST /projects/{projectId}/members
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "user-456",
  "role": "member"  // "member" или "owner"
}
```

**Ответ:**
```json
{
  "id": "pm-123",
  "user_id": "user-456",
  "project_id": "proj-123",
  "role": "member",
  "joined_at": "2026-05-14T10:00:00Z"
}
```

---

### 👥 Получить список участников

**Когда:** Открывается страница "Project Settings" → "Members"

```bash
GET /projects/{projectId}/members
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "pm-123",
      "user": {
        "id": "user-456",
        "full_name": "Jane Doe",
        "email": "jane@example.com"
      },
      "role": "owner"
    }
  ]
}
```

---

### ❌ Удалить участника из проекта

**Когда:** Владелец нажимает кнопку "Remove" рядом с участником

```bash
DELETE /projects/{projectId}/members/{memberId}
Authorization: Bearer {access_token}
```

---

## 🏃 СПРИНТЫ

### ➕ Создать новый спринт

**Когда:** Нажимаем "Create Sprint" в разделе Sprints

```bash
POST /projects/{projectId}/sprints
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Sprint 1 - May",
  "goal": "Implement core features"
}
```

**Ответ:**
```json
{
  "id": "sprint-123",
  "name": "Sprint 1 - May",
  "goal": "Implement core features",
  "project_id": "proj-123",
  "is_active": false,
  "start_date": null,
  "end_date": null,
  "created_at": "2026-05-14T10:00:00Z"
}
```

---

### 📋 Получить список спринтов проекта

**Когда:** 
- Открываем страницу Sprints
- Нужна информация об всех спринтах для планирования

```bash
GET /projects/{projectId}/sprints
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "sprint-123",
      "name": "Sprint 1 - May",
      "is_active": true,
      "issues_count": 12,
      "issues_done": 5
    },
    {
      "id": "sprint-124",
      "name": "Sprint 2 - June",
      "is_active": false,
      "issues_count": 0
    }
  ]
}
```

---

### 🚀 Запустить спринт

**Когда:** 
- После планирования спринта
- Нажимаем "Start Sprint"
- Спринт должен иметь хотя бы одну задачу!

```bash
PATCH /projects/{projectId}/sprints/{sprintId}/start
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "id": "sprint-123",
  "is_active": true,
  "started_at": "2026-05-14T10:00:00Z"
}
```

**Что делать:**
1. Обновить статус спринта в UI
2. Загрузить активный спринт для Kanban доски
3. Перенаправить на Kanban board

---

### ✅ Завершить спринт

**Когда:** 
- Нажимаем "Complete Sprint"
- Все (или большинство) задачи завершены

```bash
PATCH /projects/{projectId}/sprints/{sprintId}/complete
Authorization: Bearer {access_token}
```

**Важно:** Все незавершенные задачи вернутся в Backlog!

**Ответ:**
```json
{
  "id": "sprint-123",
  "is_active": false,
  "completed_at": "2026-05-14T10:00:00Z",
  "returned_to_backlog": 3
}
```

---

## 🎨 СТАТУСЫ (Колонки)

### ➕ Создать новый статус (колонку)

**Когда:** Владелец проекта нажимает "Add Column" на Kanban доске

```bash
POST /projects/{projectId}/statuses
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Testing",
  "category": "in_progress",
  "color": "#F97316"
}
```

**Ответ:**
```json
{
  "id": "status-123",
  "name": "Testing",
  "category": "in_progress",
  "position": 4,
  "color": "#F97316"
}
```

---

### 📋 Получить все статусы проекта

**Когда:** 
- Загрузка Kanban доски
- Обновление списка колонок

```bash
GET /projects/{projectId}/statuses
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "status-1",
      "name": "To Do",
      "position": 1,
      "color": "#6B7280"
    },
    {
      "id": "status-2",
      "name": "In Progress",
      "position": 2,
      "color": "#3B82F6"
    }
  ]
}
```

---

### ✏️ Обновить статус

**Когда:** Владелец нажимает на иконку редактирования колонки

```bash
PATCH /projects/{projectId}/statuses/{statusId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Code Review",
  "color": "#A78BFA"
}
```

---

### 🔄 Переупорядочить статусы

**Когда:** Пользователь перетаскивает колонку левее/правее

```bash
PATCH /projects/{projectId}/statuses/{statusId}/reorder
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "position": 2  // Новая позиция (между To Do и Done)
}
```

---

### ❌ Удалить статус

**Когда:** Владелец нажимает "Delete" на колонке (минимум 1 колонка должна остаться)

```bash
DELETE /projects/{projectId}/statuses/{statusId}
Authorization: Bearer {access_token}
```

**Важно:** Все задачи в этой колонке переместятся в первую оставшуюся колонку!

---

## 📌 ЗАДАЧИ (Issues)

### ➕ Создать задачу в Backlog'е

**Когда:** Нажимаем "Create Issue" в Backlog

```bash
POST /projects/{projectId}/issues
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth",
  "type_code": "task",  // "task" или "bug"
  "assignee_id": "user-456"  // optional
}
```

**Ответ:**
```json
{
  "id": "issue-123",
  "issue_number": "#1",
  "title": "Implement user authentication",
  "description": "Add JWT-based auth",
  "type_code": "task",
  "status_id": "status-1",
  "status_name": "To Do",
  "assignee": {
    "id": "user-456",
    "full_name": "Jane Doe"
  },
  "created_at": "2026-05-14T10:00:00Z"
}
```

---

### 📋 Получить все задачи Backlog'а

**Когда:** Открываем вкладку "Backlog"

```bash
GET /projects/{projectId}/issues?status_category=backlog&limit=100
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "issue-123",
      "issue_number": "#1",
      "title": "Implement user authentication",
      "type_code": "task",
      "assignee": {...},
      "rank_position": 1000
    }
  ]
}
```

---

### 📋 Получить задачи активного спринта (для Kanban)

**Когда:** Открываем Kanban доску (спринт запущен)

```bash
GET /projects/{projectId}/sprints/active/issues
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "issues": [
    {
      "id": "issue-123",
      "issue_number": "#1",
      "title": "Implement auth",
      "type_code": "task",
      "status_id": "status-1",
      "status_name": "To Do",
      "assignee": {...}
    }
  ],
  "statuses": [
    {"id": "status-1", "name": "To Do"},
    {"id": "status-2", "name": "In Progress"}
  ]
}
```

---

### 🔍 Получить детали задачи

**Когда:** Пользователь нажимает на карточку задачи для просмотра полной информации

```bash
GET /projects/{projectId}/issues/{issueId}
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "id": "issue-123",
  "issue_number": "#1",
  "title": "Implement user authentication",
  "description": "...",
  "type_code": "task",
  "status_id": "status-1",
  "status_name": "To Do",
  "assignee": {...},
  "reporter": {...},
  "created_at": "...",
  "updated_at": "..."
}
```

---

### ✏️ Обновить задачу

**Когда:** Пользователь редактирует название/описание/исполнителя задачи

```bash
PATCH /projects/{projectId}/issues/{issueId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "New title",
  "description": "Updated description",
  "assignee_id": "user-789",
  "type_code": "bug"
}
```

---

### 🎯 **ГЛАВНОЕ: Переместить задачу между колонками (Drag-n-Drop)**

**Когда:** Пользователь перетаскивает карточку с "To Do" → "In Progress" → "Done"

```bash
PATCH /projects/{projectId}/issues/{issueId}/move
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status_id": "status-2",    // ID новой колонки
  "rank_position": 1500       // Позиция в новой колонке
}
```

**Как вычислить rank_position?**

Если карточку перетаскиваете между двумя другими:
```
Предыдущая карточка: rank_position = 1000
Следующая карточка: rank_position = 2000
Ваша карточка:      rank_position = 1500 (середина)
```

Если в конец списка:
```
Последняя карточка: rank_position = 2000
Ваша карточка:      rank_position = 2100
```

---

### ➕ Добавить задачу в спринт (из Backlog'а)

**Когда:** Пользователь перетаскивает задачу из Backlog'а в Sprint Planning

```bash
PATCH /projects/{projectId}/issues/{issueId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sprint_id": "sprint-123"
}
```

**Ответ:**
```json
{
  "id": "issue-123",
  "sprint_id": "sprint-123",
  "rank_position": 1000
}
```

---

### ❌ Удалить задачу

**Когда:** Пользователь нажимает "Delete Issue" (с подтверждением)

```bash
DELETE /projects/{projectId}/issues/{issueId}
Authorization: Bearer {access_token}
```

---

## 💬 КОММЕНТАРИИ

### ➕ Добавить комментарий к задаче

**Когда:** Пользователь вводит текст в поле комментария и нажимает "Send"

```bash
POST /projects/{projectId}/issues/{issueId}/comments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "text": "This needs to be reviewed by QA team"
}
```

**Ответ:**
```json
{
  "id": "comment-123",
  "text": "This needs to be reviewed by QA team",
  "author": {
    "id": "user-456",
    "full_name": "Jane Doe",
    "avatar_url": "..."
  },
  "created_at": "2026-05-14T10:15:00Z"
}
```

---

### 📋 Получить все комментарии к задаче

**Когда:** Открывается модальное окно с деталями задачи

```bash
GET /projects/{projectId}/issues/{issueId}/comments
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "comment-123",
      "text": "This needs to be reviewed",
      "author": {...},
      "created_at": "2026-05-14T10:15:00Z"
    }
  ]
}
```

---

### ❌ Удалить комментарий

**Когда:** Автор комментария нажимает кнопку "Delete"

```bash
DELETE /projects/{projectId}/issues/{issueId}/comments/{commentId}
Authorization: Bearer {access_token}
```

---

## 🎬 ПРАКТИЧЕСКИЕ СЦЕНАРИИ

### 📖 Сценарий 1: Первый запуск приложения

```typescript
// 1. Пользователь открывает приложение
GET /users/me  // Получить текущего пользователя

// 2. Если успешно (200)
GET /projects  // Получить список проектов пользователя

// 3. Отобразить список проектов в UI
// 4. Пользователь выбирает проект

GET /projects/{projectId}  // Загрузить проект
GET /projects/{projectId}/statuses  // Загрузить статусы для Kanban

// 5. Если есть активный спринт
GET /projects/{projectId}/sprints/active

// 6. Загрузить задачи активного спринта
GET /projects/{projectId}/sprints/active/issues
```

---

### 🎨 Сценарий 2: Просмотр Kanban доски

```typescript
// Пользователь открывает Kanban board

// 1. Загрузить статусы (колонки)
GET /projects/{projectId}/statuses
// Response: [{ id, name, position, color }, ...]

// 2. Загрузить задачи активного спринта
GET /projects/{projectId}/sprints/active/issues
// Response: { issues: [...], statuses: [...] }

// 3. Отрендерить колонки с задачами
// To Do    | In Progress | Done
// [task1]  | [task2]     | [task3]
```

---

### 🔄 Сценарий 3: Drag-n-Drop между колонками

```typescript
// Пользователь перетаскивает карточку

// 1. Обнаружить новую позицию (какая колонка, какой индекс)
const newStatusId = "status-2"  // In Progress
const newPosition = 1500  // Между task1 (1000) и task3 (2000)

// 2. Отправить на сервер
PATCH /projects/{projectId}/issues/{issueId}/move
{
  "status_id": newStatusId,
  "rank_position": newPosition
}

// 3. Обновить UI (оптимистично)
// 4. После ответа - синхронизировать с сервером
```

---

### 📋 Сценарий 4: Планирование спринта

```typescript
// Пользователь открывает Sprint Planning

// 1. Получить список спринтов (все, включая draft)
GET /projects/{projectId}/sprints
// Response: [{ id, name, is_active, issues_count }, ...]

// 2. Если спринт не найден - создать новый
POST /projects/{projectId}/sprints
{
  "name": "Sprint 1",
  "goal": "MVP features"
}

// 3. Получить задачи Backlog'а
GET /projects/{projectId}/issues?status_category=backlog

// 4. При перетаскивании задачи в спринт
PATCH /projects/{projectId}/issues/{issueId}
{
  "sprint_id": "sprint-123"
}

// 5. Когда готово - запустить спринт
PATCH /projects/{projectId}/sprints/{sprintId}/start
```

---

### ✅ Сценарий 5: Завершение спринта

```typescript
// Пользователь нажимает "Complete Sprint"

// 1. Показать диалог подтверждения
// "Are you sure? Unfinished tasks will return to Backlog"

// 2. При подтверждении
PATCH /projects/{projectId}/sprints/{sprintId}/complete

// 3. Ответ содержит количество возвращенных задач
// { returned_to_backlog: 3 }

// 4. Обновить UI
// - Спринт больше не active
// - Загрузить Backlog (там будут новые задачи)
// - Показать успешное сообщение
```

---

### 👥 Сценарий 6: Создание проекта

```typescript
// Пользователь нажимает "New Project"

// 1. Отобразить форму
// Поля: name, project_key, description

// 2. При сабмите
POST /projects
{
  "name": "E-Commerce Platform",
  "project_key": "ECOM",
  "description": "..."
}

// 3. Ответ включает созданные по умолчанию статусы
// {
//   statuses: [
//     { id, name: "To Do", position: 1 },
//     { id, name: "In Progress", position: 2 },
//     { id, name: "Done", position: 3 }
//   ]
// }

// 4. Сохранить проект в state
// 5. Редирект на страницу проекта
// 6. Показать приветственное сообщение
```

---

## 📊 МАТРИЦА: Какой endpoint для какого действия

| Действие | Endpoint | Метод | Когда |
|----------|----------|-------|-------|
| **Создать задачу в Backlog** | `/projects/{id}/issues` | POST | "New Issue" нажата |
| **Переместить задачу между колонками** | `/projects/{id}/issues/{id}/move` | PATCH | Drag-n-Drop завершен |
| **Добавить задачу в спринт** | `/projects/{id}/issues/{id}` | PATCH | Drag из Backlog в Sprint |
| **Запустить спринт** | `/projects/{id}/sprints/{id}/start` | PATCH | "Start Sprint" нажата |
| **Завершить спринт** | `/projects/{id}/sprints/{id}/complete` | PATCH | "Complete Sprint" нажата |
| **Обновить название задачи** | `/projects/{id}/issues/{id}` | PATCH | Пользователь отредактировал |
| **Добавить комментарий** | `/projects/{id}/issues/{id}/comments` | POST | "Send" нажата |
| **Переупорядочить колонки** | `/projects/{id}/statuses/{id}/reorder` | PATCH | Drag-n-Drop колонки |
| **Создать новую колонку** | `/projects/{id}/statuses` | POST | "Add Column" нажата |
| **Добавить участника** | `/projects/{id}/members` | POST | "Add Member" выбран |
| **Получить активный спринт** | `/projects/{id}/sprints/active` | GET | Загрузка Kanban |
| **Получить все задачи** | `/projects/{id}/issues` | GET | Загрузка Backlog |

---

## 🔗 ЗАГОЛОВКИ И АУТЕНТИФИКАЦИЯ

**Все endpoints требуют:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Пример полного запроса:**

```bash
curl -X POST http://localhost:3000/api/projects/proj-123/issues \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New feature",
    "type_code": "task"
  }'
```

---

## ⚠️ КОДЫ ОШИБОК

| Код | Значение | Когда | Что делать |
|-----|----------|-------|-----------|
| **200** | OK | Успешный запрос | Обновить UI |
| **201** | Created | Успешное создание | Добавить в список |
| **400** | Bad Request | Неверные данные | Показать ошибку валидации |
| **401** | Unauthorized | Токен истек или отсутствует | Редирект на login |
| **403** | Forbidden | Нет прав на действие | Показать "Access denied" |
| **404** | Not Found | Ресурс не найден | Показать 404 страницу |
| **409** | Conflict | Проект архивирован или бизнес-правило нарушено | Показать конкретное сообщение |
| **500** | Server Error | Ошибка сервера | Показать "Something went wrong" |

---

## 💡 BEST PRACTICES

### 1. Оптимистичные обновления (Optimistic Updates)

```typescript
// ДО отправки запроса на сервер:
// 1. Обновить UI локально
issues.splice(oldIndex, 1);
issues.splice(newIndex, 0, issue);

// 2. Отправить запрос
await api.moveIssue(issueId, newStatus);

// 3. Если ошибка - откатить
catch (error) {
  // Вернуть обратно
  issues.splice(newIndex, 1);
  issues.splice(oldIndex, 0, issue);
  showError(error.message);
}
```

### 2. Кеширование (для более быстрых повторных запросов)

```typescript
// Используйте React Query или Zustand
const { data: projects } = useQuery(['projects'], getProjects, {
  staleTime: 10 * 60 * 1000,  // 10 минут (совпадает с бэком!)
  cacheTime: 15 * 60 * 1000   // 15 минут
});
```

### 3. Пагинация

```typescript
// Для больших списков используйте limit и offset
GET /projects?limit=50&offset=0
GET /projects?limit=50&offset=50
GET /projects?limit=50&offset=100
```

### 4. Обработка ошибок

```typescript
try {
  await api.createIssue(data);
  showSuccess("Issue created!");
  refetchIssues();
} catch (error) {
  if (error.status === 409) {
    showError("Project is archived - read-only mode");
  } else if (error.status === 403) {
    showError("You don't have permission");
  } else {
    showError("Something went wrong");
  }
}
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- **Swagger API Documentation**: http://localhost:3000/api
- **Полный backend код**: `/backend/src/`
- **Architecture**: `/backend/docs/product/ARCHITECTURE.md`
- **Database Schema**: `/backend/prisma/schema.prisma`

---

**Версия документа:** 1.0  
**Дата обновления:** May 14, 2026  
**Статус:** ✅ Production Ready
