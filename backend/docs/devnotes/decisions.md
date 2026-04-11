db контейнер с Postgres + volume для данных.
backend контейнер, который подключается к БД по db:5432.
Makefile с базовыми командами: up, down, logs, ps, restart, migrate.