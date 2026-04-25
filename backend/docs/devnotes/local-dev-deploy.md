# Локальный запуск backend через контейнеры

## 1. Общая идея

Текущий локальный контур backend описан не внутри `backend/`, а в корне проекта `aml-task/`.

Это важно:
- папка `backend/` содержит код backend-приложения;
- файлы локального запуска контейнеров лежат уровнем выше;
- локальный запуск backend сейчас завязан на общий root проекта.

## 2. Какие файлы участвуют

Основные файлы локального контура:

- `aml-task/docker-compose.yaml`
- `aml-task/Makefile`
- `aml-task/.env.prod`
- `aml-task/.env.example`
- `aml-task/backend/Dockerfile`

Дополнительно backend использует:

- `backend/prisma/schema.prisma`
- `backend/prisma.config.ts`

## 3. Что поднимается локально

В локальном docker-compose сейчас описаны два сервиса:

### `postgres`

Поднимается контейнер PostgreSQL:
- образ: `postgres:16-alpine`
- container name: `aml_postgres_db`
- volume: `postgres_data`
- healthcheck через `pg_isready`

### `backend`

Поднимается backend-контейнер:
- build context: `./backend`
- Dockerfile: `backend/Dockerfile`
- container name: `aml_backend_api`
- backend стартует командой:

```sh
node dist/src/main.js
```

## 4. Какой env используется

Сейчас локальный docker-контур использует файл:

- `aml-task/.env.prod`

Это не идеальная схема для локальной разработки, но именно так настроен текущий процесс.

Через этот файл в контейнеры передаются:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `DATABASE_URL`
- `BACKEND_PORT`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`

Для ориентира можно смотреть:
- `aml-task/.env.example`
- `aml-task/.env.prod.example`

## 5. Как собрать и запустить локально

Все команды выполняются из корня проекта:

```sh
cd aml-task
```

### Вариант 1. Через Makefile

Поднять контейнеры:

```sh
make up
```

Команда делает:

```sh
docker compose --env-file .env.prod up -d --build
```

### Вариант 2. Напрямую через docker compose

```sh
docker compose --env-file .env.prod up -d --build
```

## 6. Что происходит при запуске

Флоу сейчас такой:

1. Docker Compose читает `.env.prod`.
2. Поднимается контейнер `postgres`.
3. Docker ждет, пока PostgreSQL пройдет healthcheck.
4. Собирается image backend из `backend/Dockerfile`.
5. Внутри Dockerfile:
   - ставятся зависимости;
   - выполняется `npx prisma generate`;
   - выполняется `npm run build`.
6. После сборки стартует runtime-контейнер backend.
7. Backend внутри контейнера слушает порт `3000`.
8. На хост пробрасывается `${BACKEND_PORT:-3000}:3000`.

## 7. Как проверить, что backend поднялся

После запуска можно проверить:

### Swagger

```text
http://localhost:3000/api/docs
```

или другой порт, если в `.env.prod` задан свой `BACKEND_PORT`.

### Healthcheck

```text
http://localhost:3000/api/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

## 8. Полезные команды

Все команды выполняются из корня `aml-task/`.

### Остановить контейнеры

```sh
make down
```

### Посмотреть состояние контейнеров

```sh
make ps
```

### Посмотреть логи всех сервисов

```sh
make logs
```

### Посмотреть только backend-логи

```sh
make backend-logs
```

### Зайти внутрь backend-контейнера

```sh
make backend-shell
```

### Перезапустить только backend

```sh
make backend-restart
```

### Сгенерировать Prisma client

```sh
make generate
```

### Выполнить `prisma db pull`

```sh
make deploy-pull
```

## 9. Отдельный режим без контейнера backend

Сейчас в `Makefile` есть команда:

```sh
make devrun
```

Она запускает:

```sh
cd backend && npm run start:dev
```

Это полезно, если:
- база уже поднята отдельно;
- backend хочется гонять локально без контейнера;
- нужен hot reload NestJS.

## 10. Что важно помнить

Текущий локальный процесс рабочий, но у него есть особенности:

1. Локальный контур использует `.env.prod`, что не очень удобно по названию.
2. Deploy-файлы лежат не в `backend/`, а в корне `aml-task/`.
3. Локальный и production контур похожи по идее, но используют разные compose-файлы.

## 11. Что можно улучшить позже

Полезные следующие улучшения:

- завести отдельный `.env.local` или `.env.dev`;
- явно разделить локальный и production env;
- добавить отдельный документ с migration flow для локальной среды;
- при необходимости вынести локальный запуск backend в отдельный compose-профиль.
