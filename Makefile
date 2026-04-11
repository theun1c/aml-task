.PHONY: up down ps pull generate

up: 
	docker compose --env-file .env.prod up -d --build

down: 
	docker compose down 

ps: 
	docker compose ps 

logs:
	docker compose logs -f
	
pull:
	npx prisma db pull 

generate: 
	npx prisma generate 

devrun:
	npm run start:dev