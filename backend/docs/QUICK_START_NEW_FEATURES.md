# Быстрый старт: Новые Features (Redis, Pino, RabbitMQ)

## 🔴 REDIS Кеширование

### Базовое использование - Cacheable decorator

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { Cacheable } from '../infrastructure/cache/cache.decorator';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  @Cacheable(600) // кеш на 600 секунд
  async getUserById(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
    });
  }

  @Cacheable(300) // кеш на 5 минут
  async getProjectMembers(projectId: string) {
    return this.prisma.project_members.findMany({
      where: { project_id: projectId },
    });
  }
}
```

### Когда использовать:
- ✅ GET endpoints, которые часто читают одни и те же данные
- ❌ POST/PUT/DELETE операции
- ✅ Дорогостоящие queries (много JOIN'ов)

---

## 🟢 PINO Логирование

### Базовое использование

```typescript
// issues.service.ts
import { Injectable } from '@nestjs/common';
import { PinoLoggerService } from '../infrastructure/logger/pino-logger.service';

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private logger: PinoLoggerService,
  ) {}

  async create(projectId: string, dto: CreateIssueDto) {
    this.logger.info('Creating issue', { projectId, title: dto.title });
    
    try {
      const issue = await this.prisma.issues.create({
        data: { project_id: projectId, title: dto.title },
      });
      
      this.logger.info('Issue created', { issueId: issue.id });
      return issue;
    } catch (error) {
      this.logger.error('Failed to create issue', error);
      throw error;
    }
  }
}
```

### Когда логировать:
- ✅ Начало/конец важных операций
- ✅ Ошибки с контекстом
- ❌ Не логировать sensitive данные (пароли, токены)

---

## 🔵 RabbitMQ Уведомления

### Публиковать событие

```typescript
// comments.service.ts
import { RabbitMQService } from '../infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
  ) {}

  async createComment(issueId: string, userId: string, text: string) {
    const comment = await this.prisma.comments.create({
      data: { issue_id: issueId, user_id: userId, text },
    });

    // Опубликовать событие
    await this.rabbitmq.publishNotification({
      type: 'COMMENT_ADDED',
      userId,
      projectId: 'get from issue', // TODO: получить projectId
      data: {
        commentId: comment.id,
        issueId,
        text,
      },
    });

    return comment;
  }
}
```

### Слушать события (для worker'а позже)

```typescript
// notification-worker.ts (separate service)
@Injectable()
export class NotificationWorker implements OnModuleInit {
  constructor(private rabbitmq: RabbitMQService) {}

  async onModuleInit() {
    await this.rabbitmq.consumeNotifications(async (event) => {
      switch (event.type) {
        case 'ISSUE_CREATED':
          await this.sendEmailNotification(event);
          break;
        case 'COMMENT_ADDED':
          await this.sendCommentNotification(event);
          break;
      }
    });
  }

  private async sendEmailNotification(event: NotificationEvent) {
    // TODO: интеграция с email сервисом
    console.log('Sending email for', event.type);
  }
}
```

---

## 📋 Типы событий RabbitMQ

```typescript
export interface NotificationEvent {
  type: 'ISSUE_CREATED' | 'ISSUE_UPDATED' | 'ISSUE_ASSIGNED' | 'COMMENT_ADDED';
  userId: string;        // кто совершил действие
  projectId: string;     // в каком проекте
  data: Record<string, any>; // детали события
}
```

---

## 🧪 Тестирование локально

### Redis
```bash
# В отдельном терминале подняли dev окружение:
docker compose -f backend/docker-compose.dev.yaml up

# Проверить redis работает:
redis-cli ping
# Должно вывести: PONG

# Очистить кеш:
redis-cli FLUSHALL
```

### Pino логи
```bash
# Логи выводятся в консоль при NODE_ENV=development
# В production - пишутся в /var/log/aml-backend.log
npm run start:dev
# Увидите красивые логи в консоли
```

### RabbitMQ
```bash
# RabbitMQ Management UI доступен на:
# http://localhost:15672
# Username: guest
# Password: guest

# Посмотреть очереди:
# Management UI → Queues → aml_notifications
```

---

## ⚡ Quick Checklist

- [ ] Redis работает в docker-compose.dev.yaml
- [ ] CacheModule добавлен в AppModule
- [ ] @Cacheable(600) добавлен на GET endpoints
- [ ] LoggerModule добавлен в AppModule
- [ ] logger.info() добавлен в критичные места
- [ ] RabbitMQModule добавлен в AppModule
- [ ] publishNotification() вызывается в важных операциях
- [ ] .env.prod содержит REDIS_HOST, RABBITMQ_URL

---

## 🚀 Production deployment

```bash
# 1. Обновить package-lock.json:
npm install

# 2. Проверить собирается:
npm run build

# 3. Коммитить и пушить:
git add backend/package.json backend/package-lock.json
git commit -m "feat: add caching, logging, rabbitmq"
git push origin main

# 4. GitHub Actions автоматически:
# - Собирает Docker образ
# - Пушит в Docker Hub
# - Деплоит на prod сервер
```

