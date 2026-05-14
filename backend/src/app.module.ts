import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { resolveEnvFilePath } from './infrastructure/config/env-file';
import { IssuesModule } from './issues/issues.module';
import { ProjectsModule } from './projects/projects.module';
import { StatusesModule } from './statuses/statuses.module';
import { SprintsModule } from './sprints/sprints.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePath(process.env),
    }),
    PrismaModule,
    CacheModule,
    LoggerModule,
    RabbitMQModule,
    AuthModule,
    UsersModule,
    IssuesModule,
    ProjectsModule,
    StatusesModule,
    SprintsModule,
    CommentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
