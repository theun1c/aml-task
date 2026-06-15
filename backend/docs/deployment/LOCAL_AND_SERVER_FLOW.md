# Local and server flow

## What this repo expects

- `frontend/` can stay empty.
- Backend is built from `backend/Dockerfile`.
- PostgreSQL is created by Docker Compose.
- The database schema is initialized once from root `script_db.txt`.
- Runtime schema is `aml_task`.
- Prisma migrations are not used.

## Local backend checks

```bash
cd backend
npm ci
npm run build
npm test -- --runInBand
```

## Local production-like Docker run

Copy env example:

```bash
cp .env.prod.example .env.prod
```

Edit secrets in `.env.prod`, then run:

```bash
docker compose --env-file .env.prod -f docker-compose.yaml up -d --build
curl http://localhost:3000/api/health
```

The first run creates the Postgres volume and executes `script_db.txt`.

## Re-run DB bootstrap locally

Only do this when you can lose local data:

```bash
docker compose --env-file .env.prod -f docker-compose.yaml down -v
docker compose --env-file .env.prod -f docker-compose.yaml up -d --build
```

## Production server shape

Prepare `/opt/aml-task` with:

```text
.env.prod
docker-compose.prod.yaml
script_db.txt
```

Then:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d postgres redis rabbitmq backend
curl http://127.0.0.1:3000/api/health
```

To validate compose with example values without creating `.env.prod`:

```bash
APP_ENV_FILE=.env.prod.example docker compose --env-file .env.prod.example -f docker-compose.prod.yaml config
```

## GitHub secrets for CI/CD

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
DOCKERHUB_BACKEND_REPO
SSH_HOST
SSH_USER
SSH_KEY
SSH_PORT
```

Until Docker Hub secrets are configured, CI still runs build/test and builds the
Docker image without pushing it.
