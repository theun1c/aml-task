# AML-task backend

Backend для AML Task Manager.

Сейчас это NestJS API с Prisma/PostgreSQL, Swagger-документацией и базовым модулем авторизации.

## Где доступен backend

- Swagger / API docs: [http://194.156.118.99/api/docs](http://194.156.118.99/api/docs)
- Базовый префикс API: `http://194.156.118.99/api`
- Healthcheck: `GET http://194.156.118.99/api/health`

Проект сейчас доступен в тестовом режиме.

## Что уже реализовано

### `auth`

Сейчас в backend реализован модуль авторизации:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `GET /auth/sessions`

Что уже есть внутри:
- регистрация и логин по `email + password`;
- access и refresh токены;
- refresh rotation;
- logout текущей сессии;
- logout всех сессий;
- получение текущего пользователя;
- просмотр активных сессий;
- Swagger-описание auth endpoint;
- базовые unit и e2e тесты.

### `health`

Есть технический endpoint для проверки доступности backend:
- `GET /health`

## Архитектура

Backend строится как модульный монолит.

Основная идея:
- проект делится по доменным модулям;
- внутри каждого модуля есть своя структура;
- инфраструктура отделяется от бизнес-логики.

Текущая базовая структура:

```text
src/
  auth/
  users/
  projects/
  issues/
  comments/
  infrastructure/
  common/
```

Внутри модулей используется layered-структура:
- `controllers` — HTTP-вход;
- `services` — бизнес-логика;
- `dto` — входные модели и валидация;
- `responses` — модели ответов;
- `repositories` — слой доступа к данным по мере роста логики.

Отдельно архитектура зафиксирована в [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md).

## Какие модули уже есть в проекте

### Реально используются сейчас

- `auth`
- `infrastructure/prisma`
- `health`

### Подготовлены как каркас для следующей разработки

- `users`
- `projects`
- `issues`
- `comments`
- `common`
- `infrastructure/config`

## Ближайшие задачи

Важное:
- настроить сертификаты и HTTPS через nginx;
- получить домен;
- продолжить развитие backend-модулей кроме `auth`.

Технический следующий шаг:
- разгрузить `AuthService`;
- начать выносить повторяющиеся Prisma-запросы в `repositories`;
- описать деплой backend;
- протестировать сервер на нагрузку и отказоустойчивость;
- почистить проект от лишних файлов и временных артефактов.

## Документация

- Архитектура: [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md)
- Техническое задание: [docs/product/TECH_SPEC.md](docs/product/TECH_SPEC.md)
- Спецификация auth: [docs/codex/features/001-auth/SPEC.md](docs/codex/features/001-auth/SPEC.md)
- Задачи по auth: [docs/codex/features/001-auth/TASKS.md](docs/codex/features/001-auth/TASKS.md)
