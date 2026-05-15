# 📚 FRONTEND API DOCUMENTATION

**Полная документация по API для фронтенд разработчиков**

---

## 📖 ЧТО ЗДЕСЬ?

Этот пакет документации содержит **всё что нужно знать фронтендеру** о backend API:

- ✅ Какой endpoint вызывать и когда
- ✅ Как устроены request/response
- ✅ Примеры и сценарии
- ✅ Обработка ошибок
- ✅ Диаграммы процессов
- ✅ Быстрый поиск

---

## 📁 ФАЙЛЫ ДОКУМЕНТАЦИИ

### 1. 🚀 **FRONTEND_DOCUMENTATION_INDEX.md** ← НАЧНИТЕ ОТСЮДА

**Карта всей документации.** Содержит:
- Краткое описание каждого документа
- Когда использовать какой документ
- Выбор по сценарию
- Контрольный список
- Рекомендуемый порядок чтения

**Время:** 5 минут

---

### 2. ⚡ **FRONTEND_API_QUICK_LOOKUP.md**

**Быстрый справочник - найди endpoint за 10 секунд!**

Содержит:
- Таблица всех endpoints по действиям
- Поиск по endpoint'у
- Поиск по сценарию
- TOP 10 самых используемых
- Примеры curl команд
- Коды ошибок

**Используйте:** Когда нужно срочно найти нужный endpoint

**Время:** 5-10 минут поиска

---

### 3. 📖 **FRONTEND_API_GUIDE.md** (САМАЯ ПОЛНАЯ)

**Полная документация по КАЖДОМУ endpoint'у.**

Содержит:
- Описание каждого endpoint'а
- **КОГДА его вызывать** - точное объяснение
- Request body примеры
- Response примеры
- Что делать при успехе
- Что делать при ошибке
- Практические сценарии (6 основных)
- Best practices

**Используйте:** Когда разрабатываете feature

**Время:** 30 минут на все, 5 минут на нужный раздел

---

### 4. 🎬 **FRONTEND_API_FLOWS.md** (С ДИАГРАММАМИ)

**Визуальные диаграммы ВСЕХ процессов.**

Содержит:
- 10 полных сценариев с Mermaid диаграммами
- Sequencediagram (кто вызывает кого)
- Граф-диаграммы (условия и переходы)
- Матрицы действие → endpoint
- Как читать диаграммы

**Используйте:** Когда нужно понять как всё работает вместе

**Время:** 15-20 минут на все

---

### 5. 📋 **FRONTEND_API_REFERENCE.json**

**JSON структура для парсирования в коде.**

Содержит:
- Все endpoints в JSON формате
- Структура каждого endpoint'а
- Request/response примеры
- Коды ошибок
- Critical flows

**Используйте:** Когда интегрируете в код или делаете генератор

---

## 🎯 БЫСТРЫЙ СТАРТ

### Вы новичок в проекте?

```
1. Откройте: FRONTEND_DOCUMENTATION_INDEX.md
   ↓
2. Прочитайте: FRONTEND_API_QUICK_LOOKUP.md
   ↓
3. Посмотрите: FRONTEND_API_FLOWS.md (первые 2 сценария)
   ↓
4. Кодьте! 🚀
```

**Время:** 20 минут

---

### Вам нужен конкретный endpoint?

```
1. Откройте: FRONTEND_API_QUICK_LOOKUP.md
2. Найдите через Ctrl+F
3. Получите ответ за 10 секунд!
```

---

### Вам нужно реализовать сложный feature?

```
1. Откройте: FRONTEND_API_GUIDE.md
2. Найдите нужный раздел (СПРИНТЫ, ЗАДАЧИ, etc)
3. Смотрите примеры и практические сценарии
4. Откройте: FRONTEND_API_FLOWS.md
5. Посмотрите похожий сценарий-диаграмму
```

---

## 📊 ВЫБОР ДОКУМЕНТА ПО СИТУАЦИИ

| Ситуация | Документ | Время |
|----------|----------|-------|
| Новичок в проекте | INDEX → QUICK_LOOKUP → FLOWS | 20 мин |
| Срочно найти endpoint | QUICK_LOOKUP | 30 сек |
| Разрабатываю feature | API_GUIDE | 20 мин |
| Нужна архитектура процесса | API_FLOWS | 15 мин |
| Парсирую в коде | API_REFERENCE.json | 5 мин |
| Полное понимание | Все | 60 мин |

---

## 🏗️ СТРУКТУРА ДОКУМЕНТОВ

```
FRONTEND_DOCUMENTATION_INDEX.md
│
├─ Поводитель по всем документам
├─ Выбор по сценарию
├─ Контрольный список
└─ Рекомендуемый порядок

┌──────────────────────────────────────────────────┐
│ БЫСТРЫЕ СПРАВОЧНИКИ                              │
├──────────────────────────────────────────────────┤
│ QUICK_LOOKUP.md          ← Таблицы и примеры     │
│ API_REFERENCE.json       ← JSON структуры        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ПОДРОБНЫЕ ГАЙДЫ                                  │
├──────────────────────────────────────────────────┤
│ API_GUIDE.md             ← Всё о каждом endpoint │
│ API_FLOWS.md             ← Диаграммы процессов  │
└──────────────────────────────────────────────────┘
```

---

## 💡 КЛЮЧЕВЫЕ МОМЕНТЫ

### ⭐ Самый важный endpoint

```
PATCH /projects/{projectId}/issues/{issueId}/move
```

Используется для: **Drag-n-Drop между Kanban колонками**

→ Подробнее: [QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md#-важные-запросы)

---

### 🎯 TOP 10 самых используемых endpoints

1. `GET /projects/{id}/sprints/active/issues` - Kanban
2. `PATCH /projects/{id}/issues/{id}/move` - Drag-drop ⭐
3. `GET /projects` - Load projects
4. `POST /projects/{id}/issues` - Create issue
5. `GET /projects/{id}/issues?status_category=backlog` - Load backlog
6. `GET /projects/{id}` - Load project
7. `POST /projects` - Create project
8. `PATCH /projects/{id}/sprints/{id}/start` - Start sprint
9. `PATCH /projects/{id}/sprints/{id}/complete` - Complete sprint
10. `POST /projects/{id}/issues/{id}/comments` - Add comment

---

### 🔐 Аутентификация

Все endpoints требуют:

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

Если токен истек → используйте `POST /auth/refresh`

---

### 🎬 Основные сценарии

1. **Первый запуск** - Загрузить пользователя и проекты
2. **Просмотр Kanban** - Загрузить колонки и задачи
3. **Drag-n-Drop** - Переместить задачу между колонками
4. **Sprint Planning** - Добавить задачи в спринт
5. **Создание проекта** - Auto-create 3 статуса
6. **Завершение спринта** - Вернуть незавершенные в backlog

---

## 🚀 НАЧАЛО РАБОТЫ

### Шаг 1: Прочитайте INDEX

```
→ FRONTEND_DOCUMENTATION_INDEX.md
```

Это займет 5 минут и даст полное понимание где что.

---

### Шаг 2: Используйте QUICK_LOOKUP

```
→ FRONTEND_API_QUICK_LOOKUP.md
```

Сохраняйте закладку, будете часто пользоваться.

---

### Шаг 3: Погружение в детали

```
→ FRONTEND_API_GUIDE.md (нужные разделы)
→ FRONTEND_API_FLOWS.md (нужные сценарии)
```

По мере разработки feature'ов.

---

## 📋 ФОРМАТЫ ДОКУМЕНТОВ

### Markdown (.md)

**Используется:** Подробные гайды и диаграммы Mermaid

- Легко читать в GitHub
- Автоматическая нумерация заголовков
- Mermaid диаграммы отображаются в GitHub
- Ctrl+F поиск работает отлично

**Инструменты:**
- VS Code + Markdown Preview
- GitHub (автоматически)
- GitBook
- Notion

---

### JSON (.json)

**Используется:** Структурированные данные для парсирования

**Парсируется:** В Python, JavaScript, Java, etc

---

## ⚙️ ПРАКТИЧЕСКАЯ ИНТЕГРАЦИЯ

### В React коде

```typescript
import ENDPOINTS from 'docs/FRONTEND_API_REFERENCE.json';

// Используйте структуру
const endpoint = ENDPOINTS.actions.find(a => a.id === 'issues_move_CRITICAL');
console.log(endpoint.endpoint); // PATCH /projects/{id}/issues/{id}/move
```

---

### В Postman

1. Откройте QUICK_LOOKUP.md
2. Найдите нужный endpoint
3. Скопируйте curl пример
4. Вставьте в Postman

---

### В README frontend'а

```markdown
## API Документация

Смотрите: [Backend API Guide](/docs/FRONTEND_API_GUIDE.md)
Быстрый поиск: [Quick Lookup](/docs/FRONTEND_API_QUICK_LOOKUP.md)
```

---

## ✅ КОНТРОЛЬНЫЙ СПИСОК

Перед началом разработки:

- [ ] Прочитал FRONTEND_DOCUMENTATION_INDEX.md
- [ ] Открыл FRONTEND_API_QUICK_LOOKUP.md в закладках
- [ ] Знаю какие endpoints нужны для моего feature
- [ ] Знаю структуру request/response
- [ ] Знаю как обрабатывать ошибки

Перед коммитом:

- [ ] Все endpoints работают
- [ ] Протестировал в Postman/curl
- [ ] Обработал все коды ошибок (401, 403, 409, 400)
- [ ] Использовал optimistic updates
- [ ] Использовал кеширование для GET

---

## 🔗 СВЯЗАННЫЕ ДОКУМЕНТЫ

### Backend документация

- [Backend Overview](COMPLETE_OVERVIEW.md)
- [Backend Architecture](product/ARCHITECTURE.md)
- [Backend Tech Spec](product/TECH_SPEC.md)

### Swagger API

http://localhost:3000/api

### Исходный код backend

`/backend/src/`

---

## 📞 ПОДДЕРЖКА

### Не нашел ответ?

1. Проверьте [QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md) - 90% вопросов там
2. Посмотрите [API_FLOWS.md](FRONTEND_API_FLOWS.md) - диаграммы часто помогают
3. Проверьте Swagger: http://localhost:3000/api
4. Спросите у тима в Slack

### Нашел ошибку?

1. Откройте Issue в GitHub
2. Обновите документацию (PR)
3. Поделитесь с командой

---

## 📈 СТАТИСТИКА ДОКУМЕНТАЦИИ

| Метрика | Значение |
|---------|----------|
| Документов | 5 файлов |
| Endpoints описано | 30+ |
| Сценариев | 10 диаграмм |
| Примеров кода | 50+ |
| Таблиц | 20+ |
| Общее время чтения | 60 минут |
| Время поиска endpoint | 10 секунд |

---

## 🎓 УРОВНИ ПОНИМАНИЯ

### Уровень 1: Новичок (1-2 часа)

Знаю:
- Какой endpoint вызвать для своего feature
- Какие данные отправлять
- Как обработать ответ

**Документы:** INDEX → QUICK_LOOKUP → FLOWS (1-2 сценария)

---

### Уровень 2: Разработчик (1 день)

Знаю:
- Все основные endpoints
- Практики best practice'ы
- Как обрабатывать ошибки
- Как оптимизировать запросы

**Документы:** Все документы + практика

---

### Уровень 3: Эксперт (1 неделя)

Знаю:
- Всю архитектуру backend'а
- Все edges cases
- Внутреннее устройство (кеш, события, логи)
- Можу объяснять другим

**Документы:** Backend документы + исходный код

---

## 🏆 ЦЕЛЬ

Когда вы закончите документацию:

✅ Знаете какой endpoint вызвать  
✅ Знаете точно что отправлять  
✅ Знаете точно что получите в ответ  
✅ Знаете как обработать ошибку  
✅ Можете реализовать любой feature  

---

## 📚 ВЕРСИЯ И ЛИЦЕНЗИЯ

- **Версия документации:** 1.0
- **Дата:** May 14, 2026
- **Статус:** ✅ Production Ready
- **Язык:** Русский
- **Лицензия:** MIT (как основной проект)

---

## 🚀 ГОТОВЫ КОДИТЬ?

Выбирайте:

- **Совсем новичок?** → [FRONTEND_DOCUMENTATION_INDEX.md](FRONTEND_DOCUMENTATION_INDEX.md)
- **Срочно нужен endpoint?** → [FRONTEND_API_QUICK_LOOKUP.md](FRONTEND_API_QUICK_LOOKUP.md)
- **Нужна полная информация?** → [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
- **Нужны диаграммы?** → [FRONTEND_API_FLOWS.md](FRONTEND_API_FLOWS.md)

**GO CODE! 🚀**
