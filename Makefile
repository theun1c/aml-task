.PHONY: up down ps logs build restart backend-logs backend-shell backend-restart migrate deploy-pull generate devrun

up:
	docker compose --env-file .env.prod up -d --build

down:
	docker compose --env-file .env.prod down

ps:
	docker compose --env-file .env.prod ps

logs:
	docker compose --env-file .env.prod logs -f

build:
	docker compose --env-file .env.prod build

restart:
	docker compose --env-file .env.prod restart

backend-logs:
	docker compose --env-file .env.prod logs -f backend

backend-shell:
	docker compose --env-file .env.prod exec backend sh

backend-restart:
	docker compose --env-file .env.prod restart backend

migrate:
	cd backend && npx prisma migrate deploy

deploy-pull:
	cd backend && npx prisma db pull

generate:
	cd backend && npx prisma generate

devrun:
	cd backend && npm run start:dev
