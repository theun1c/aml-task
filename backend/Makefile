ENV_FILE ?= .env.prod
SSH_HOST ?= 194.156.118.99
SSH_PORT ?= 22
SSH_USER ?= theun1c
DB_LOCAL_PORT ?= 5433
DB_REMOTE_HOST ?= 127.0.0.1
DB_REMOTE_PORT ?= 5432

.PHONY: develop start-dev sync-db-schema prisma-generate ssh-tunnel

develop: sync-db-schema start-dev

start-dev:
	ENV_FILE=$(ENV_FILE) npm run start:dev

sync-db-schema: prisma-pull prisma-generate

prisma-pull:
	ENV_FILE=$(ENV_FILE) npx prisma db pull

prisma-generate:
	ENV_FILE=$(ENV_FILE) npx prisma generate

ssh-tunnel:
	ssh -L $(DB_LOCAL_PORT):$(DB_REMOTE_HOST):$(DB_REMOTE_PORT) -p $(SSH_PORT) $(SSH_USER)@$(SSH_HOST)
