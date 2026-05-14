# 📚 Документация: Кеширование, Логирование, RabbitMQ

## 🎯 Что было добавлено

Я добавил **три инфраструктурных сервиса** для production-ready backend:

### 1️⃣ **REDIS КЕШИРОВАНИЕ** 
**Файлы:**
- `src/infrastructure/cache/cache.module.ts` - модуль подключения Redis
- `src/infrastructure/cache/cache.decorator.ts` - декоратор для автоматического кеширования

**Зачем:**
- ускорить GET запросы (кеш на 5-10 минут)
- снизить нагрузку на БД
- улучшить UX (быстрее ответы)

**Как работает:**
```
@Cacheable(600) // кеш на 600 секунд
async getUserById(userId: string) { ... }

// 1-й запрос: берет из БД, кеширует результат
// 2-9й запрос (в течение 600 сек): берет из Redis, не трогает БД
// 601-й запрос: кеш истек, снова берет из БД
```

---

### 2️⃣ **PINO ЛОГИРОВАНИЕ**
**Файлы:**
- `src/infrastructure/logger/pino-logger.service.ts` - сервис логирования
- `src/infrastructure/logger/logger.module.ts` - модуль

**Зачем:**
- видеть что происходит в приложении (обслуживание)
- debug в production (что упало и почему)
- audit trail (кто что сделал)

**Как работает:**
```
// Когда что-то происходит:
this.logger.info('Creating issue', { projectId, title: dto.title })

// В development: видишь красивые логи в консоли
// В production: пишется в файл /var/log/aml-backend.log
```

---

### 3️⃣ **RABBITMQ BROKER** 
**Файлы:**
- `src/infrastructure/rabbitmq/rabbitmq.service.ts` - сервис RabbitMQ
- `src/infrastructure/rabbitmq/rabbitmq.module.ts` - модуль

**Зачем:**
- асинхронно отправлять уведомления (не блокировать запрос)
- интегрировать с email/SMS сервисами позже
- масштабировать (добавить worker для обработки)

**Как работает:**
```
// Когда создается задача:
await this.rabbitmq.publishNotification({
  type: 'ISSUE_CREATED',
  userId: user.id,
  projectId,
  data: { issueId, title, assigneeId }
})

// Сообщение отправляется в RabbitMQ очередь "aml_notifications"
// Позже worker может забрать и отправить email/SMS
```

---

## 🧪 ПОЛНОЕ ТЕСТИРОВАНИЕ

### Тест 1: Redis Кеширование

**Шаг 1: Добавляем @Cacheable на GET endpoint**

[backend/src/projects/services/projects.service.ts](projects/services/projects.service.ts):
```typescript
import { Cacheable } from '../../infrastructure/cache/cache.decorator';

@Injectable()
export class ProjectsService {
  
  @Cacheable(600) // кеш на 10 минут
  async findByIdForUser(projectId: string, userId: string): Promise<ProjectResponse> {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
      include: { project_members: true },
    });
    // ... rest of logic
  }
}
```

**Шаг 2: Тестируем кеш через curl**

```bash
# ПЕРВЫЙ запрос - БЕЗ кеша (видимо медленнее):
time curl -X GET http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# real    0m0.156s  <- медленнее, берет из БД

# ВТОРОЙ запрос - С КЕШЕМ (видимо быстрее):
time curl -X GET http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# real    0m0.025s  <- быстрее! из Redis
```

**Шаг 3: Проверяем кеш в Redis прямо**

```bash
# В отдельном терминале:
redis-cli

# Видим все ключи кеша:
> KEYS *
# Outputs: 
# "findByIdForUser:..."

# Посмотреть значение:
> GET "findByIdForUser:..."
# Outputs JSON с проектом

# Очистить кеш:
> FLUSHALL

# Проверить что очищено:
> KEYS *
# Outputs: (empty list)
```

---

### Тест 2: Pino Логирование

**Шаг 1: Интегрируем логирование в сервис**

[backend/src/issues/services/issues.service.ts](issues/services/issues.service.ts):
```typescript
import { PinoLoggerService } from '../../infrastructure/logger/pino-logger.service';

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLoggerService, // добавили
  ) {}

  async create(projectId: string, user: AuthenticatedUser, dto: CreateIssueDto) {
    // Логируем начало операции
    this.logger.info('Creating issue', { 
      projectId, 
      title: dto.title,
      userId: user.id 
    });

    try {
      const issue = await this.prisma.issues.create({
        data: {
          project_id: projectId,
          title: dto.title,
          reporter_id: user.id,
        },
      });

      // Логируем успех
      this.logger.info('Issue created successfully', { 
        issueId: issue.id,
        number: issue.issue_number,
      });

      return this.toIssueResponse(issue);
    } catch (error) {
      // Логируем ошибку
      this.logger.error('Failed to create issue', error);
      throw error;
    }
  }
}
```

**Шаг 2: Смотрим логи в development**

```bash
# Запустите dev режим:
npm run start:dev

# Создайте задачу через API:
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Issue", "type_code": "task"}'

# В консоли вы увидите красивые логи:
# [5:25:14 AM] INFO Creating issue { projectId: "xxx", title: "Test Issue", userId: "yyy" }
# [5:25:14 AM] INFO Issue created successfully { issueId: "zzz", number: 1 }
```

**Шаг 3: Смотрим логи в production**

```bash
# На prod сервере:
ssh -p SSH_PORT SSH_USER@SSH_HOST

# Логи пишутся в:
tail -f /var/log/aml-backend.log

# Вы увидите:
# {"level":30,"time":1715667914123,"issueId":"xxx","number":1}
# {"level":30,"time":1715667914456,"error":"Connection timeout"}
```

---

### Тест 3: RabbitMQ Уведомления

**Шаг 1: Проверяем что сообщения публикуются**

[backend/src/issues/services/issues.service.ts](issues/services/issues.service.ts) - уже добавлено:
```typescript
async create(...) {
  const createdIssue = await this.prisma.$transaction(async (tx) => {
    // ... создаем задачу
  });

  const response = this.toIssueResponse(createdIssue);
  
  // ✅ ПУБЛИКУЕМ событие в RabbitMQ
  await this.rabbitmq.publishNotification({
    type: 'ISSUE_CREATED',
    userId: user.id,
    projectId,
    data: {
      issueId: createdIssue.id,
      title: createdIssue.title,
      assigneeId: createdIssue.assignee_id,
    },
  });

  return response;
}
```

**Шаг 2: Смотрим очередь в RabbitMQ Management UI**

```bash
# Откройте браузер:
http://localhost:15672

# Логин:
Username: guest
Password: guest

# Переходите: Queues tab → найдите "aml_notifications"
# Вы увидите:
# - Queue name: aml_notifications
# - Messages ready: 5  (если 5 сообщений в очереди)
# - Consumers: 0 (нет worker'ов что слушают очередь)
```

**Шаг 3: Проверяем сообщения через RabbitMQ CLI**

```bash
# Внутри контейнера:
docker exec -it rabbitmq_dev_aml rabbitmqctl

# Или через amqplib (Node.js):

# Создайте скрипт test-rabbitmq.js:
const amqp = require('amqplib');

async function consumeMessages() {
  const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('aml_notifications');
  
  console.log('Listening for messages...');
  
  await channel.consume('aml_notifications', (msg) => {
    if (msg) {
      console.log('Received:', JSON.parse(msg.content.toString()));
      channel.ack(msg); // подтверждаем что обработали
    }
  });
}

consumeMessages().catch(console.error);

// Запустите:
node test-rabbitmq.js

// Создайте задачу через API в другом терминале:
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/issues ...

// Вы увидите в консоли:
// Received: { 
//   type: 'ISSUE_CREATED',
//   userId: 'xxx',
//   projectId: 'yyy',
//   data: { issueId: 'zzz', title: 'Test Issue', assigneeId: null }
// }
```

---

## 📊 ПОЛНЫЙ ПОТОК ТЕСТИРОВАНИЯ (пошагово)

### 1️⃣ Подготовка (5 минут)

```bash
# Убедитесь что контейнеры запущены:
cd backend
docker compose -f docker-compose.dev.yaml ps

# Должны быть: postgres, redis, rabbitmq - все healthy

# Запустите dev режим:
npm run start:dev

# В другом терминале создайте пользователя:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# Скопируйте access_token из ответа
export TOKEN="your_access_token"
```

### 2️⃣ Тест кеширования (5 минут)

```bash
# Создайте проект:
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "project_key": "TEST",
    "description": "Testing cache"
  }' | jq .id

export PROJECT_ID="project_id_from_above"

# Первый запрос (БЕЗ кеша):
time curl -s http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Второй запрос (С КЕШЕМ):
time curl -s http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Обратите внимание: второй запрос быстрее!

# Проверьте Redis:
redis-cli KEYS "*findByIdForUser*"
```

### 3️⃣ Тест логирования (5 минут)

```bash
# Смотрите логи в консоли npm run start:dev

# Создайте задачу:
curl -X POST http://localhost:3000/api/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue for Logging",
    "type_code": "task"
  }'

# В консоли вы должны увидеть:
# [timestamp] INFO Creating issue { ... }
# [timestamp] INFO Issue created successfully { ... }
```

### 4️⃣ Тест RabbitMQ (5 минут)

```bash
# В отдельном терминале запустите consumer:
cat > test-rabbitmq.js << 'EOF'
const amqp = require('amqplib');

async function start() {
  try {
    const conn = await amqp.connect('amqp://guest:guest@localhost:5672');
    const ch = await conn.createChannel();
    await ch.assertQueue('aml_notifications');
    
    console.log('🚀 Waiting for messages...\n');
    
    await ch.consume('aml_notifications', (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('📨 NEW EVENT:');
        console.log(JSON.stringify(event, null, 2));
        console.log('---\n');
        ch.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

start();
EOF

node test-rabbitmq.js

# В другом терминале создайте задачу:
curl -X POST http://localhost:3000/api/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Testing RabbitMQ", "type_code": "bug"}'

# В консоли test-rabbitmq.js вы увидите:
# 📨 NEW EVENT:
# {
#   "type": "ISSUE_CREATED",
#   "userId": "xxx",
#   "projectId": "yyy",
#   "data": {
#     "issueId": "zzz",
#     "title": "Testing RabbitMQ",
#     "assigneeId": null
#   }
# }
```

---

## 🎬 ДЕМОНСТРАЦИЯ ДЛЯ ДРУГИХ

Скрипт для full demo (копируйте весь блок целиком):

```bash
#!/bin/bash

set -e

export TOKEN="your_token"
export PROJECT_ID="your_project_id"

echo "🎬 DEMO: Redis Cache"
echo "===================="
echo "1️⃣ First request (no cache):"
time curl -s http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "2️⃣ Second request (cached):"
time curl -s http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "✨ Второй запрос быстрее благодаря Redis!"
echo ""

echo "🎬 DEMO: Pino Logging"
echo "===================="
echo "Смотрите логи в консоли npm run start:dev когда создается задача..."
echo ""

curl -X POST http://localhost:3000/api/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo Issue", "type_code": "task"}' -s > /dev/null

echo ""
echo "🎬 DEMO: RabbitMQ"
echo "===================="
echo "Откройте http://localhost:15672 (guest/guest)"
echo "Перейдите в Queues → aml_notifications"
echo "Вы увидите 1 новое сообщение в очереди!"
```

---

## 📍 ГДЕ НАХОДЯТСЯ СООБЩЕНИЯ RABBITMQ?

### В Development:
```
RabbitMQ контейнер: rabbitmq_dev_aml
Очередь: aml_notifications
Управление: http://localhost:15672
```

### В Production:
```
RabbitMQ контейнер: aml_rabbitmq
Очередь: aml_notifications
Управление: http://SERVER_IP:15672 (если доступен)
```

### Текущие типы событий:
```
- ISSUE_CREATED    (когда создается задача)
- ISSUE_UPDATED    (когда обновляется задача)
- ISSUE_ASSIGNED   (когда назначается исполнитель)
- COMMENT_ADDED    (когда добавляется комментарий)
```

### Куда потом добавить обработчик?

**Вариант 1: Microservice (отдельный worker)**
```
/backend/src/notifications-worker.ts
- слушает очередь aml_notifications
- отправляет email
- отправляет SMS
- сохраняет в БД
```

**Вариант 2: Internal service (внутри приложения)**
```
Implement NotificationService что слушает очередь и обрабатывает
```

---

## ✅ ПРОВЕРКА ЧТО ВСЕ РАБОТАЕТ

```bash
# 1. Redis работает?
redis-cli ping
# Outputs: PONG ✅

# 2. RabbitMQ работает?
curl -s http://localhost:15672/api/health/checks/local_alarms -u guest:guest | grep ok
# Outputs: ... "ok": true ✅

# 3. Логи пишутся?
npm run start:dev 2>&1 | grep -i "error\|warn\|info"
# Outputs: логи ✅
```

