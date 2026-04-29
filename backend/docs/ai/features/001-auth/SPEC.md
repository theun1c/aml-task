# SPEC.md
# Фича: auth

## 1. Цель
Сделать практичную аутентификацию для MVP:
- регистрация по `email + password`;
- вход по `email + password`;
- обновление access token через refresh token;
- logout текущей авторизованной сессии.

Фича реализуется через Prisma + PostgreSQL уже на старте (допускается временная локальная/тестовая БД).

## 2. Границы фичи
### Входит
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- хеширование пароля (`bcrypt`)
- выдача JWT access token + refresh token
- хранение refresh token в БД в виде хеша
- базовая валидация входных DTO

### Не входит
- профиль пользователя (`GET /users/me`, `PATCH /users/me`) — отдельная фича/модуль
- восстановление пароля
- подтверждение email
- OAuth/social login
- сложный RBAC/ACL кроме базовой проверки "пользователь аутентифицирован"

## 3. Пользовательские сценарии
1. Новый пользователь регистрируется с валидным email и паролем -> получает `accessToken`, `refreshToken` и профиль.
2. Существующий пользователь логинится с правильными данными -> получает `accessToken`, `refreshToken` и профиль.
3. Пользователь логинится с телефона и с браузера -> обе сессии остаются валидными независимо друг от друга.
4. Access token истек -> пользователь отправляет `refreshToken` в `POST /auth/refresh` и получает новую пару токенов.
5. Пользователь делает `POST /auth/logout` с валидным access token -> текущая сессия отзывается, остальные сессии продолжают работать.
6. Пользователь передает неверные credentials -> получает 401.
7. Пользователь передает некорректный email/слишком короткий пароль -> получает 400 с деталями валидации.

## 4. Бизнес-правила
- Email уникален (регистронезависимо).
- Пароль хранится только в виде хеша.
- Минимальная длина пароля: 8 символов.
- Access token живет 15 минут.
- Refresh token живет 7 дней.
- В ответах API поле `passwordHash` не возвращается.
- При ошибке логина не раскрываем, что именно неверно (email или пароль).
- Refresh token не хранится в открытом виде (только hash).
- После refresh выдается новая пара токенов, старый refresh становится невалидным (rotation).
- У пользователя может быть несколько активных refresh-сессий одновременно (например, телефон + браузер).
- `POST /auth/logout` доступен только с валидным access token.
- `POST /auth/logout` отзывает только текущую сессию пользователя по `sessionId` из access token.

## 5. API-контракт
### `POST /auth/register`
Request:
```json
{
  "email": "user@example.com",
  "password": "strongPass123",
  "name": "Alex"
}
```
Response `201`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Alex"
  }
}
```

### `POST /auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "strongPass123"
}
```
Response `200`: как в `register`.

### `POST /auth/refresh`
Request:
```json
{
  "refreshToken": "<jwt>"
}
```
Response `200`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

### `POST /auth/logout`
Request:
- Bearer access token в заголовке `Authorization`.

Response `200`:
```json
{
  "success": true
}
```

### Swagger/OpenAPI (базово для MVP)
- Все endpoint фичи `auth` должны быть описаны в Swagger.
- Для каждого endpoint должны быть указаны:
  - краткое описание операции;
  - схема request body;
  - основные ответы (`200/201/400/401/409` где применимо).
- В Swagger не должно быть примеров/схем с `passwordHash`.

## 6. Модели данных / изменения в БД
Минимальная модель `users`:
- `id: string (uuid)`
- `email: string (unique)`
- `passwordHash: string`
- `name: string`
- `createdAt: Date`
- `updatedAt: Date`

Минимальная модель `refresh_tokens`:
- `id: string (uuid)`
- `userId: string (fk -> users.id)`
- `tokenHash: string`
- `expiresAt: Date`
- `revokedAt: Date | null`
- `createdAt: Date`

## 7. Валидация
- `email`: обязателен, валидный email.
- `password`: обязателен, min length = 8.
- `name`: обязателен, длина 2..50.
- `refreshToken`: обязателен в `refresh`.
- Trim для `email` и `name`.
- Email нормализуется в lowercase перед проверкой уникальности.

## 8. Ошибки и edge cases
- Регистрация на существующий email -> `409 Conflict`.
- Логин несуществующего пользователя -> `401 Unauthorized`.
- Логин с неправильным паролем -> `401 Unauthorized`.
- Невалидный/просроченный JWT -> `401 Unauthorized`.
- Невалидный/просроченный refresh token -> `401 Unauthorized`.
- Повторное использование уже отозванного refresh token -> `401 Unauthorized`.
- `POST /auth/logout` без access token -> `401 Unauthorized`.
- Logout в одной сессии не должен инвалидировать refresh token других сессий пользователя.
- Пустые/неполные поля -> `400 Bad Request`.
- Попытка передать лишние поля в DTO -> отклонять (whitelist).

## 9. Критерии готовности
- Все 4 endpoint работают по контракту.
- Пароль не хранится/не возвращается в открытом виде.
- Refresh token не хранится в открытом виде.
- Бизнес-правила уникальности email и проверки credentials соблюдены.
- Написаны базовые unit-тесты сервиса auth.
- Написаны e2e-тесты happy-path + ключевые ошибки.
- Swagger-документация для `auth` endpoint актуальна и проверена вручную.

## 10. Заметки по архитектуре
- Разделить уровни:
  - `AuthService` — бизнес-логика аутентификации.
  - `UsersRepository` и `RefreshTokenRepository` — абстракции хранения.
  - `JwtStrategy/Guard` — проверка токена.
- Реализацию строить сразу поверх Prisma, сохраняя чистые границы между сервисом и доступом к данным.
