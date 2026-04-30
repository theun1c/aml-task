import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { resolveEnvFilePath } from './infrastructure/config/env-file';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePath(process.env),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    IssuesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
