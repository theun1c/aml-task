ENV_FILE ?= .env.dev

.PHONY: develop start-dev sync-db-schema prisma-generate ssh-tunnel

develop: sync-db-schema start-dev

start-dev:
	ENV_FILE=$(ENV_FILE) npm run start:dev

sync-db-schema: prisma-pull prisma-generate

prisma-pull:
	ENV_FILE=$(ENV_FILE) npx prisma db pull

prisma-generate:
	ENV_FILE=$(ENV_FILE) npx prisma generate

postgres-dev-up: 
	docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d

postgres-dev-down:
	docker compose --env-file .env.dev -f docker-compose.dev.yaml down