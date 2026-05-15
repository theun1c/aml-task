# 📚 FRONTEND DOCUMENTATION INDEX

**Все документы для фронтендера в одном месте!**

---

## 🎯 НАЧНИТЕ ОТСЮДА

### 1️⃣ Совсем новичок? Начните с этого

→ **[FRONTEND_API_QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md)** (5 минут)

**Содержит:**
- Таблица всех endpoints
- Какой endpoint для какого действия
- TOP 10 самых важных endpoints
- Быстрые примеры curl

✅ **Используйте:** Когда срочно нужно найти нужный endpoint

---

### 2️⃣ Нужна полная документация?

→ **[FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)** (30 минут)

**Содержит:**
- Подробное описание КАЖДОГО endpoint'а
- Когда его вызывать
- Примеры request/response
- Что делать при успехе и ошибке
- Практические сценарии (6 основных)
- Best practices

✅ **Используйте:** Когда разрабатываете конкретный feature

---

### 3️⃣ Нужны визуальные диаграммы?

→ **[FRONTEND_API_FLOWS.md](FRONTEND_API_FLOWS.md)** (15 минут)

**Содержит:**
- 10 полных сценариев с диаграммами Mermaid
- Sequencediagram для всех процессов
- Графы для сложных flows
- Матрицы действие → endpoint
- Как читать диаграммы

✅ **Используйте:** Когда нужно понять как всё работает вместе

---

### 4️⃣ Нужны JSON структуры для кода?

→ **[FRONTEND_API_REFERENCE.json](FRONTEND_API_REFERENCE.json)** (парсить программно)

**Содержит:**
- JSON с описанием ВСЕХ endpoints
- Структура для парсинга в коде
- Все возможные коды ошибок
- Critical flows список
- Common errors

✅ **Используйте:** Когда интегрируете в код или делаете генератор

---

## 🗺️ КАРТА ДОКУМЕНТОВ

```
backend/docs/
│
├── 🔴 FRONTEND ДОКУМЕНТАЦИЯ
│   ├── ⚡ FRONTEND_API_QUICK_LOOKUP.md        ← НАЧНИТЕ ОТСЮДА
│   ├── 📖 FRONTEND_API_GUIDE.md               ← Полная документация
│   ├── 🎬 FRONTEND_API_FLOWS.md               ← Диаграммы
│   ├── 📋 FRONTEND_API_REFERENCE.json         ← JSON структура
│   └── 📑 FRONTEND_DOCUMENTATION_INDEX.md     ← ТЫ ЗДЕСЬ
│
├── 🔵 BACKEND ДОКУМЕНТАЦИЯ
│   ├── COMPLETE_OVERVIEW.md
│   ├── FEATURES_EXPLAINED.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── QUICK_REFERENCE.md
│   └── DOCUMENTATION_MAP.md
│
├── 🟢 ARCHITECTURE & SPECS
│   ├── product/
│   │   ├── ARCHITECTURE.md          ← How backend is structured
│   │   └── TECH_SPEC.md             ← Full technical specification
│   └── ai/
│       ├── CONTEXT.md
│       ├── REVIEW_CHECKLIST.md
│       └── features/
│           ├── 001-auth/
│           ├── 002-issues/
│           └── ...
```

---

## 🎯 ВЫБОР ПО СЦЕНАРИЮ

### Я только что присоединился к проекту

1. Прочитайте: [FRONTEND_API_QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md)
2. Посмотрите: [FRONTEND_API_FLOWS.md](FRONTEND_API_FLOWS.md) (первые 2 сценария)
3. Вы готовы начать! 🚀

**Время:** 15 минут

---

### Нужно реализовать Kanban board

1. Откройте: [FRONTEND_API_QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md) → Найдите "Load Kanban"
2. Откройте: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) → Раздел "ЗАДАЧИ (Issues)"
3. Посмотрите: [FRONTEND_API_FLOWS.md](FRONTEND_API_FLOWS.md) → Сценарий 2️⃣ и 3️⃣
4. Код! 💻

**Endpoints:**
- `GET /projects/{id}/sprints/active/issues` - Load issues
- `GET /projects/{id}/statuses` - Load columns
- `PATCH /projects/{id}/issues/{id}/move` - Drag-drop

---

### Нужно реализовать Drag-n-Drop

⭐ **САМОЕ ГЛАВНОЕ: Используйте ТОЛЬКО один endpoint**

→ [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) → Поиск "moveIssue" или "move"

**Endpoint:**
```
PATCH /projects/{projectId}/issues/{issueId}/move
```

**Request body:**
```json
{
  "status_id": "status-2",
  "rank_position": 1500
}
```

**Как вычислить rank_position:**
- Посередине между двумя: `(prev + next) / 2` → 1500
- В конец списка: `last_position + 100` → 2100

---

### Нужно реализовать Sprint Planning

1. Откройте: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) → Раздел "СПРИНТЫ"
2. Посмотрите: [FRONTEND_API_FLOWS.md](FRONTEND_API_FLOWS.md) → Сценарий 4️⃣
3. Endpoints:
   - `GET /projects/{id}/sprints` - Load sprints
   - `POST /projects/{id}/sprints` - Create sprint
   - `GET /projects/{id}/issues?status_category=backlog` - Load backlog
   - `PATCH /projects/{id}/issues/{id}` - Add to sprint (sprint_id)
   - `PATCH /projects/{id}/sprints/{id}/start` - Start sprint

---

### Нужна обработка ошибок

1. Откройте: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) → Раздел "⚠️ КОДЫ ОШИБОК"
2. Найдите нужный код (401, 403, 409, etc)
3. Смотрите "Что делать"

**Частые:**
- **401** → Токен истек → Редирект на login
- **403** → Нет доступа → Show "Access denied"
- **409** → Проект архивирован → Show "Read-only mode"

---

### Нужна аутентификация

→ [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) → Раздел "АУТЕНТИФИКАЦИЯ"

**Endpoints:**
- `POST /auth/register` - Sign up
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

---

## 📊 ТАБЛИЦА БЫСТРОГО ДОСТУПА

### По типу документа

| Документ | Формат | Для кого | Размер |
|----------|--------|---------|--------|
| QUICK_LOOKUP | Markdown таблицы | Все | ⚡ 5 мин |
| API_GUIDE | Markdown подробный | Разработчик | 📖 30 мин |
| API_FLOWS | Markdown + Mermaid | Архитектор | 🎬 20 мин |
| API_REFERENCE | JSON | Парсер/API | 📋 - |

### По компоненту (Issues)

| Действие | Документ | Страница |
|----------|----------|---------|
| Создать | API_GUIDE | "Создать задачу в Backlog" |
| Переместить | API_GUIDE | "Переместить задачу" |
| Редактировать | API_GUIDE | "Обновить задачу" |
| Добавить в спринт | API_GUIDE | "Добавить задачу в спринт" |
| Все вместе | API_FLOWS | Сценарий 3️⃣ и 5️⃣ |

---

## 🔍 КАК ИСКАТЬ

### Нужно найти конкретный endpoint?

**Способ 1:** [QUICK_LOOKUP](FRONTEND_API_QUICK_LOOKUP.md) → Поиск Ctrl+F

**Способ 2:** [API_GUIDE](FRONTEND_API_GUIDE.md) → Поиск по названию раздела

**Способ 3:** [API_REFERENCE.json](FRONTEND_API_REFERENCE.json) → Парсить JSON по id

---

### Нужно понять как всё работает?

**Способ 1:** [API_FLOWS](FRONTEND_API_FLOWS.md) → Найти похожий сценарий

**Способ 2:** [API_GUIDE](FRONTEND_API_GUIDE.md) → Раздел "Практические сценарии"

---

### Нужны примеры кода?

**Способ 1:** [API_GUIDE](FRONTEND_API_GUIDE.md) → Примеры в каждом разделе

**Способ 2:** [API_REFERENCE.json](FRONTEND_API_REFERENCE.json) → request_body примеры

---

## 💡 ЛУЧШИЕ ПРАКТИКИ

### 1. Optimistic Updates

```typescript
// 1. Update UI immediately
issues = issues.filter(i => i.id !== issueId);

// 2. Send to server
try {
  await api.deleteIssue(issueId);
} catch (error) {
  // 3. Revert if error
  issues = [newIssue, ...issues];
}
```

→ Подробнее: [API_GUIDE.md](FRONTEND_API_GUIDE.md) → Best Practices

---

### 2. Кеширование

Backend кеширует GET запросы на **10 минут**:
```
GET /projects/{id}   (first)  → 200ms (DB hit)
GET /projects/{id}   (within 10 min) → 15ms (Redis hit)
GET /projects/{id}   (after 10 min)  → 200ms (DB again)
```

Используйте React Query с одинаковым стейлтайм!

---

### 3. Пагинация

```
GET /projects?limit=50&offset=0
GET /projects?limit=50&offset=50
GET /projects?limit=50&offset=100
```

→ Подробнее: [API_GUIDE.md](FRONTEND_API_GUIDE.md) → Best Practices

---

## ✅ КОНТРОЛЬНЫЙ СПИСОК

### Перед началом разработки

- [ ] Прочитал [QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md)
- [ ] Посмотрел [API_FLOWS.md](FRONTEND_API_FLOWS.md) - нужные сценарии
- [ ] Знаю какие endpoints нужны для моего feature
- [ ] Знаю структуру request/response для каждого

### Перед коммитом

- [ ] Все endpoints работают (протестировал в Postman/curl)
- [ ] Обработал ошибки (401, 403, 409, 400)
- [ ] Добавил optimistic updates где нужно
- [ ] Использую кеширование для GET запросов
- [ ] Документировал сложные части

---

## 📞 НУЖНА ПОМОЩЬ?

### Документация не помогла?

1. Проверьте Swagger: http://localhost:3000/api
2. Посмотрите backend код: `/backend/src/`
3. Запросите review: обсудите с тимом

### Нашли ошибку в документации?

1. Откройте Issues в GitHub
2. Обновите документацию и сделайте PR
3. Поделитесь с командой

---

## 📈 ВЕРСИЯ И СТАТУС

- **Версия документации:** 1.0
- **Статус:** ✅ Production Ready
- **Последнее обновление:** May 14, 2026
- **Совместимость:** Backend v1.0+
- **Язык:** Русский + English

---

## 🎓 РЕКОМЕНДУЕМЫЙ ПОРЯДОК ЧТЕНИЯ

### День 1 (Новичок)

1. ⚡ [QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md) - 5 мин
2. 🎬 [API_FLOWS.md](FRONTEND_API_FLOWS.md) - Сценарий 1️⃣ и 2️⃣ - 10 мин
3. Уже можете начинать кодить! 🚀

### День 2-3 (Разработка)

1. 📖 [API_GUIDE.md](FRONTEND_API_GUIDE.md) - Нужные разделы - 20 мин
2. 🎬 [API_FLOWS.md](FRONTEND_API_FLOWS.md) - Все сценарии - 20 мин
3. Разрабатываете feature

### День 4+ (Углубленное знание)

1. 📋 [API_REFERENCE.json](FRONTEND_API_REFERENCE.json) - Парсить + код
2. Backend код: `/backend/src/`
3. Swagger документация

---

## 🏆 ЧТО ВЫЗОВЕТ ГОРДОСТЬ

Когда вы сделали:

- ✅ Работающий Kanban board
- ✅ Drag-n-Drop между колонками
- ✅ Sprint Planning
- ✅ Создание/редактирование задач
- ✅ Комментарии к задачам
- ✅ Все обработано без ошибок

**Вы ГОТОВЫ к production!** 🚀

---

## 📌 ГЛАВНЫЕ ВЫВОДЫ

1. **⚡ Начните с QUICK_LOOKUP** - там есть всё нужное
2. **🎯 Используйте правильный endpoint** - таблица даст ответ за 10 секунд
3. **🎬 Смотрите диаграммы** - картинка стоит тысячи слов
4. **💬 Спросите если не поняли** - тим поможет

---

**Нашли полезным? Поделитесь с фронтенд-тимом!** 📢

**Готовы кодить?** → [QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md) 🚀
