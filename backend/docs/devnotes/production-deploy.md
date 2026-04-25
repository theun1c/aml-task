# Production deployment backend

## 1. Общая идея

Текущий production deploy backend тоже описан не внутри `backend/`, а в корне проекта `aml-task/`.

Production-контур сейчас строится так:

1. изменения попадают в `main`;
2. запускается GitHub Actions workflow `CI Backend`;
3. backend собирается, тестируется и публикуется в Docker Hub;
4. после успешного CI запускается workflow `Deploy Backend`;
5. deploy идет по SSH на сервер;
6. сервер подтягивает новый backend image и перезапускает backend-контейнер;
7. выполняется healthcheck;
8. при неудаче выполняется rollback на предыдущий image tag.

## 2. Какие файлы участвуют

Основные production-файлы:

- `aml-task/.github/workflows/ci-backend.yml`
- `aml-task/.github/workflows/deploy-backend.yml`
- `aml-task/docker-compose.prod.yaml`
- `aml-task/.env.prod`
- `aml-task/.env.prod.example`
- `aml-task/backend/Dockerfile`

## 3. Что делает CI workflow

Файл:

- `.github/workflows/ci-backend.yml`

### Когда он запускается

Сейчас workflow запускается:
- на `push` в `main`;
- только если изменения касаются backend или deploy-файлов;
- вручную через `workflow_dispatch`.

### Что он делает

Флоу CI сейчас такой:

1. Checkout репозитория.
2. Setup Node.js 24.
3. Установка зависимостей в `backend/` через `npm ci`.
4. Генерация Prisma client через `npx prisma generate`.
5. Сборка backend через `npm run build`.
6. Запуск тестов через `npm test -- --passWithNoTests`.
7. Логин в Docker Hub.
8. Сборка backend image.
9. Публикация image в Docker Hub.

### Какие теги image создаются

Сейчас image публикуется с двумя тегами:

- `latest`
- `sha-<commit_sha>`

Пример:

```text
your_dockerhub_username/aml-backend:latest
your_dockerhub_username/aml-backend:sha-abcdef123456
```

## 4. Что делает deploy workflow

Файл:

- `.github/workflows/deploy-backend.yml`

### Когда он запускается

Он запускается через `workflow_run`, то есть после завершения `CI Backend`.

Но deploy пойдет только если:
- `CI Backend` завершился успешно;
- ветка была `main`.

### Что делает deploy

Deploy workflow подключается по SSH на сервер и выполняет команды уже на сервере.

Текущий путь на сервере:

```sh
cd /opt/aml-task
```

## 5. Какой compose используется в production

Production-контур использует:

- `docker-compose.prod.yaml`

В нем сейчас описаны:

### `postgres`

- локальный PostgreSQL-контейнер на сервере;
- проброс только на `127.0.0.1:5432`;
- volume `postgres_data`;
- env из `.env.prod`.

### `backend`

- backend не собирается на сервере;
- вместо этого используется уже готовый image из Docker Hub;
- image выбирается через:

```text
${DOCKERHUB_BACKEND_REPO}:${BACKEND_IMAGE_TAG}
```

- контейнер слушает `127.0.0.1:3000:3000`.

Это значит, что backend в production запускается как контейнер из ранее опубликованного Docker image.

## 6. Какой env используется в production

Production использует:

- `aml-task/.env.prod`

Важные переменные:

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
- `DOCKERHUB_BACKEND_REPO`
- `BACKEND_IMAGE_TAG`

Ориентир по формату:

- `.env.prod.example`

## 7. Подробный production flow

Ниже текущий deploy-процесс шаг за шагом.

### Шаг 1. Изменения попадают в `main`

После push в `main` GitHub запускает `CI Backend`.

### Шаг 2. CI собирает и публикует image

Если сборка и тесты проходят:
- backend image пушится в Docker Hub;
- image получает тег `sha-<commit_sha>`.

### Шаг 3. Deploy workflow подключается к серверу

Workflow `Deploy Backend` идет по SSH на сервер.

Для этого используются GitHub Secrets:
- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `SSH_PORT`

### Шаг 4. На сервере вычисляется новый тег

Новый тег формируется так:

```text
sha-${{ github.event.workflow_run.head_sha }}
```

Также из `.env.prod` читается предыдущий тег:

```text
BACKEND_IMAGE_TAG=<previous_tag>
```

Если его нет, используется `latest`.

### Шаг 5. `.env.prod` обновляется на сервере

На сервере workflow заменяет:

```text
BACKEND_IMAGE_TAG=...
```

на новый тег.

То есть production-контур не меняет compose-файл, а меняет тег image через env.

### Шаг 6. Сервер логинится в Docker Hub

Используются secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

После этого сервер может скачать новый backend image.

### Шаг 7. Выполняется очистка docker-артефактов

Сейчас workflow выполняет:

- `docker image prune -af`
- `docker builder prune -af`
- `docker container prune -f`

Это нужно для очистки лишних артефактов перед обновлением.

### Шаг 8. Сервер подтягивает новый backend image

Выполняется:

```sh
docker compose --env-file .env.prod -f docker-compose.prod.yaml pull backend
```

### Шаг 9. Перезапускается только backend

Выполняется:

```sh
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d --no-deps backend
```

Важно:
- PostgreSQL не пересоздается;
- обновляется только backend-контейнер.

### Шаг 10. Выполняется healthcheck

Workflow проверяет:

```text
http://127.0.0.1:3000/api/health
```

Проверка делается циклом до 30 попыток с паузой 2 секунды.

Если backend отвечает успешно, deploy считается успешным.

## 8. Как работает rollback

Если healthcheck не проходит:

1. workflow пишет в `.env.prod` старый `BACKEND_IMAGE_TAG`;
2. снова делает `docker compose pull backend`;
3. снова выполняет `docker compose up -d --no-deps backend`;
4. проверяет health endpoint еще раз.

Если старый image поднимается успешно, rollback считается успешным.

Таким образом, rollback сейчас основан на возврате к предыдущему docker image tag.

## 9. Какие secrets нужны

Для production deploy сейчас нужны GitHub Secrets:

### SSH

- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `SSH_PORT`

### Docker Hub

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKERHUB_BACKEND_REPO`

## 10. Как проверить production после деплоя

Основные точки проверки:

### На сервере локально

```text
http://127.0.0.1:3000/api/health
```

### Снаружи

```text
http://194.156.118.99/api/health
http://194.156.118.99/api/docs
```

Если `health` отвечает, а Swagger открывается, значит backend после deploy хотя бы базово доступен.

## 11. Что важно помнить

Текущий production flow уже рабочий, но у него есть особенности:

1. Deploy-файлы лежат в корне `aml-task/`, а не в `backend/`.
2. Production пока работает без HTTPS.
3. Reverse proxy и nginx пока не зафиксированы как отдельный конфиг в репозитории.
4. Production migration flow пока не описан как отдельный обязательный шаг.

## 12. Что стоит улучшить дальше

Полезные следующие шаги:

- формализовать migration flow для production;
- отдельно задокументировать подготовку сервера `/opt/aml-task`;
- добавить nginx-конфиг и HTTPS;
- описать полный bootstrap нового сервера с нуля;
- добавить post-deploy smoke-check список.
