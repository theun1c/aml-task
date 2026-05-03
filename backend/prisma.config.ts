import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { resolveEnvFilePath } from './src/infrastructure/config/env-file';

loadEnv({
  path: resolveEnvFilePath(process.env),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
