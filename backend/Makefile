ENV_FILE ?= .env.dev
COMPOSE_FILE ?= docker-compose.dev.yml
COMPOSE := docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE)

.PHONY: dev-up dev-down dev-logs dev prisma-generate prisma-migrate-dev prisma-studio

develop-database-up:
	$(COMPOSE) up -d postgres

develop-database-down:
	$(COMPOSE) down

develop-database-logs:
	$(COMPOSE) logs -f postgres

develop-backend-up: develop-database-up
	ENV_FILE=$(ENV_FILE) npm run start:dev

develop-prisma-generate:
	ENV_FILE=$(ENV_FILE) npx prisma generate

develop-prisma-pull:
	ENV_FILE=$(ENV_FILE) npx prisma db pull

