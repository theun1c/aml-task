# AML Task Manager Backend

Backend для AML Task Manager на `NestJS + Prisma + PostgreSQL`.

## Текущее состояние

В кодовой базе уже есть модули:
- `auth`
- `users`
- `projects`
- `statuses`
- `sprints`
- `issues`
- `comments`

При этом детально задокументированы пока только:
- `auth`
- `issues`

Дополнительно синхронизированы feature-docs для:
- `users`
- `projects`
- `statuses`
- `sprints`
- `comments`

## Основной dev-flow

Сейчас проект ориентирован на работу с уже существующей PostgreSQL schema.

То есть текущий flow такой:
1. Подготовить `.env.dev` на основе `.env.example`.
2. Указать рабочий `DATABASE_URL` на существующую БД со schema `aml_task`.
3. Выполнить `make sync-db-schema`, чтобы подтянуть актуальную Prisma schema и client.
4. Запустить приложение через `make start-dev`.

Команды:

```bash
make sync-db-schema
make start-dev
```

Что делает этот flow:
- выполняет `prisma db pull`;
- выполняет `prisma generate`;
- запускает backend локально.

Важно:
- Prisma client хранится в репозитории в `generated/prisma`, потому что код импортирует его напрямую;
- если меняется `schema.prisma`, нужно выполнить `npm run prisma:generate` и закоммитить обновленный `generated/prisma`.

## Локальная инфраструктура

В репозитории есть `docker-compose.dev.yaml` с PostgreSQL-контейнером.

Полезные команды:

```bash
make postgres-dev-up
make postgres-dev-down
```

Важно:
- этот контейнер сам по себе не заменяет миграции или инициализацию схемы;
- в репозитории сейчас нет полного migration-based локального bootstrap flow;
- поэтому docker-режим полезен только если у тебя уже есть способ подготовить нужную схему БД.

## Переменные окружения

Шаблон переменных лежит в `.env.example`.

Минимально важные переменные:
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`

В репозиторий не должны попадать реальные хосты, логины, пароли, токены и другие рабочие доступы.

## Проверка проекта

Основные команды проверки:

```bash
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

## Архитектура

Backend строится как модульный монолит.

Основные ориентиры:
- доменное деление по модулям;
- тонкие controllers;
- бизнес-логика в services;
- доступ к БД через Prisma;
- публичный REST API в `snake_case`.

Подробности:
- [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md)
- [docs/product/TECH_SPEC.md](docs/product/TECH_SPEC.md)
- [docs/ai/CONTEXT.md](docs/ai/CONTEXT.md)

## Документация по фичам

Сейчас оформлены:
- [docs/ai/features/001-auth/SPEC.md](docs/ai/features/001-auth/SPEC.md)
- [docs/ai/features/001-auth/TASKS.md](docs/ai/features/001-auth/TASKS.md)
- [docs/ai/features/002-issues/SPEC.md](docs/ai/features/002-issues/SPEC.md)
- [docs/ai/features/002-issues/TASKS.md](docs/ai/features/002-issues/TASKS.md)
- [docs/ai/features/003-users/SPEC.md](docs/ai/features/003-users/SPEC.md)
- [docs/ai/features/003-users/TASKS.md](docs/ai/features/003-users/TASKS.md)
- [docs/ai/features/004-projects/SPEC.md](docs/ai/features/004-projects/SPEC.md)
- [docs/ai/features/004-projects/TASKS.md](docs/ai/features/004-projects/TASKS.md)
- [docs/ai/features/005-statuses/SPEC.md](docs/ai/features/005-statuses/SPEC.md)
- [docs/ai/features/005-statuses/TASKS.md](docs/ai/features/005-statuses/TASKS.md)
- [docs/ai/features/006-sprints/SPEC.md](docs/ai/features/006-sprints/SPEC.md)
- [docs/ai/features/006-sprints/TASKS.md](docs/ai/features/006-sprints/TASKS.md)
- [docs/ai/features/007-comments/SPEC.md](docs/ai/features/007-comments/SPEC.md)
- [docs/ai/features/007-comments/TASKS.md](docs/ai/features/007-comments/TASKS.md)

Для ревью используется:
- [docs/ai/REVIEW_CHECKLIST.md](docs/ai/REVIEW_CHECKLIST.md)
