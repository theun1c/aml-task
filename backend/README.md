# AML-task backend

Backend для AML Task Manager.

Сейчас это NestJS API с Prisma/PostgreSQL, Swagger-документацией и базовым модулем авторизации.

## Локальная dev-разработка

Для локального dev-запуска сейчас используются такие файлы:

- `.env.dev` — основной env-файл для локальной разработки. И приложение, и Prisma берут путь к env через переменную `ENV_FILE`.
- `docker-compose.dev.yml` — docker-compose конфиг для локального PostgreSQL.
- `Makefile` — основной entrypoint для dev-команд.
- `package.json` — содержит `npm run start:dev` для запуска NestJS в watch-режиме.
- `.env.example` — шаблон переменных, если нужно заново собрать локальный env-файл.

Текущий основной сценарий запуска:

```bash
make develop
```

Что делает `make develop`:

- поднимает PostgreSQL из `docker-compose.dev.yml`;
- выполняет `prisma db pull`;
- выполняет `prisma generate`;
- запускает backend через `npm run start:dev`.

Полезные dev-команды:

- `make develop-database-up` — поднять только dev-базу.
- `make develop-backend-up` — поднять dev-базу и запустить backend.
- `make develop-database-logs` — смотреть логи PostgreSQL.
- `make develop-database-down` — остановить dev-compose.

Если `ENV_FILE` не передан явно, в `Makefile` по умолчанию используется `.env.dev`.

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
- Спецификация auth: [docs/ai/features/001-auth/SPEC.md](docs/ai/features/001-auth/SPEC.md)
- Задачи по auth: [docs/ai/features/001-auth/TASKS.md](docs/ai/features/001-auth/TASKS.md)
