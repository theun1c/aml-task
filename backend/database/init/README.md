# Database bootstrap

The project does not use Prisma migrations. PostgreSQL is initialized from the
root `script_db.txt` file by Docker Compose.

Both compose files mount it as:

```text
/docker-entrypoint-initdb.d/001_bootstrap.sql
```

The official PostgreSQL image executes files from that directory only when the
database volume is created for the first time. If you change `script_db.txt` and
want to apply it again locally, recreate the Postgres volume.

For production, back up data before recreating the volume.
