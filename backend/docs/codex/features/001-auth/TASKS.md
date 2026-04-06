# TASKS.md

# Фича: auth

## Статус

- [x] planned
- [x] in progress
- [ ] done

## 1. Подготовка

- [ ] Уточнить финальный контракт ответов для `register/login/refresh/logout/me`.
- [ ] Зафиксировать стратегию refresh rotation (ротация + отзыв старого refresh).
- [ ] Определить env-переменные: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`.

## 2. Изменения в БД

- [ ] Описать модель `users` в Prisma schema.
- [ ] Добавить таблицу `refresh_tokens` (хеш токена, expiry, revokedAt, userId).
- [ ] Зафиксировать уникальность email (нормализация в lowercase + unique index).
- [ ] Создать и применить миграцию Prisma для auth-моделей.

## 3. Модули / структура

- [ ] Создать/проверить модуль `auth`.
- [ ] Выделить `UsersRepository` интерфейс.
- [ ] Выделить `RefreshTokenRepository` интерфейс.
- [ ] Подключить `JwtModule` c конфигом из env для access/refresh.

## 4. DTO и валидация

- [ ] `RegisterDto`: email/password/name.
- [ ] `LoginDto`: email/password.
- [ ] `RefreshDto`: refreshToken.
- [ ] `LogoutDto`: refreshToken.
- [ ] Включить `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- [ ] Нормализовать email (`trim + lowercase`).

## 5. Бизнес-логика

- [ ] Регистрация: проверка уникальности email, хеширование пароля, создание пользователя.
- [ ] Логин: проверка credentials, единая ошибка `401`.
- [ ] Генерация пары токенов (`access`, `refresh`) с минимальным payload (`sub`, `email`).
- [ ] Сохранение hash refresh token в БД.
- [ ] Refresh: валидация refresh, отзыв старого, выпуск новой пары токенов.
- [ ] Logout: отзыв refresh token.
- [ ] Получение текущего пользователя по `sub` из токена.

## 6. Контроллеры / API

- [ ] `POST /auth/register`.
- [ ] `POST /auth/login`.
- [ ] `POST /auth/refresh`.
- [ ] `POST /auth/logout`.
- [ ] `GET /auth/me` (под guard).
- [ ] Привести HTTP-коды к контракту (`201/200/401/409/400`).

## 6.1 Swagger / OpenAPI

- [ ] Добавить теги и краткие описания операций для всех `auth` endpoint.
- [ ] Описать request/response DTO для `register/login/refresh/logout/me`.
- [ ] Описать основные коды ответов (`200/201/400/401/409` где применимо).
- [ ] Настроить bearer auth схему и пометить `GET /auth/me` как защищенный endpoint.
- [ ] Проверить, что в Swagger не светится `passwordHash`.

## 7. Права доступа / security

- [ ] Настроить `JwtStrategy` и `AuthGuard('jwt')`.
- [ ] Исключить возврат `passwordHash` в любых ответах.
- [ ] Исключить хранение refresh token в открытом виде (только hash).
- [ ] Добавить безопасные сообщения об ошибках логина (без утечки деталей).
- [ ] Проверить срок жизни токена и обработку expired token.

## 8. Тестирование

- [ ] Unit: `AuthService` (register/login/refresh/logout/validate).
- [ ] Unit: edge cases (duplicate email, wrong password, unknown email).
- [ ] Unit: edge cases refresh (expired/revoked/invalid token).
- [ ] E2E: `register -> login -> me` happy path.
- [ ] E2E: `login -> refresh -> me` с новым access token.
- [ ] E2E: 401 без токена и с невалидным токеном.

## 9. Ручная проверка

- [ ] Зарегистрировать пользователя через Swagger/Postman.
- [ ] Выполнить логин и проверить, что токен работает в `GET /auth/me`.
- [ ] Проверить `refresh` и убедиться, что старый refresh становится невалидным.
- [ ] Проверить `logout` и убедиться, что refresh после logout не работает.
- [ ] Проверить конфликт при повторной регистрации того же email.
- [ ] Проверить валидацию email/password/name.

## 10. Definition of Done

- [ ] Все endpoint auth (`register/login/refresh/logout/me`) соответствуют `SPEC.md`.
- [ ] Бизнес-правила и ошибки покрыты тестами.
- [ ] Нет утечек `passwordHash`.
- [ ] Нет хранения refresh token в открытом виде.
- [ ] Swagger-документация auth полная и соответствует фактическому API.
- [ ] Документация фичи актуальна и согласована с `CONTEXT.md` и `TECH_SPEC.md`.
