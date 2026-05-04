# AML-task backend

Backend для AML Task Manager.

Сейчас это NestJS API с Prisma/PostgreSQL, Swagger-документацией и базовым модулем авторизации.

## Локальная dev-разработка

Проект работает в режиме `remote-db only`: backend запускается локально, а Prisma и приложение подключаются к удаленной PostgreSQL через SSH-туннель.

Основные файлы:

- `.env.prod` — основной env-файл для подключения к удаленной БД через локальный SSH-туннель.
- `Makefile` — основной entrypoint для dev-команд.
- `.env.example` — шаблон переменных для remote DB режима.

Рекомендуемый сценарий запуска:

```bash
make ssh-tunnel
```

В отдельном терминале:

```bash
make sync-db-schema
make start-dev
```

Что делает этот flow:

- выполняет `prisma db pull`;
- выполняет `prisma generate`;
- запускает backend через `npm run start:dev` против удаленной БД.

Полезные dev-команды:

- `make ssh-tunnel` — открыть SSH-туннель к удаленной PostgreSQL.
- `make sync-db-schema` — подтянуть актуальную схему из БД и пересобрать Prisma Client.
- `make start-dev` — запустить backend локально.
- `make develop` — выполнить `sync-db-schema`, затем запустить backend.

Если `ENV_FILE` не передан явно, в `Makefile` по умолчанию используется `.env.prod`.

## Подключение к удаленной БД

База данных на сервере недоступна напрямую извне, поэтому подключение идет через SSH-туннель:

```text
localhost:5433 on your machine
-> SSH tunnel
-> 127.0.0.1:5432 on the server
-> PostgreSQL
```

Пример:

```bash
ssh -L 5433:127.0.0.1:5432 theun1c@194.156.118.99
```

После этого `DATABASE_URL` в `.env.prod` может оставаться в формате:

```env
DATABASE_URL=postgresql://aml_user:root123@localhost:5433/aml_db?schema=aml_task
```

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

- `auth`
- `infrastructure/prisma`
- `health`
- `users`
- `issues`

## Ближайшие задачи

Важное:
- продолжить развитие backend-модулей кроме `auth`;
- стабилизировать flow синхронизации Prisma со схемой удаленной БД;
- почистить проект от лишних dev-артефактов.

Технический следующий шаг:
- разгрузить `AuthService`;
- начать выносить повторяющиеся Prisma-запросы в `repositories`;
- описать деплой backend;
- протестировать сервер на нагрузку и отказоустойчивость.

## Документация

- Архитектура: [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md)
- Техническое задание: [docs/product/TECH_SPEC.md](docs/product/TECH_SPEC.md)
