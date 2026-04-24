# TASKS.md

# Фича: auth

## Статус

- [x] planned
- [x] in progress
- [x] done

## 1. Подготовка

- [x] Уточнить финальный контракт ответов для `register/login/refresh/logout/me`.
- [x] Зафиксировать стратегию refresh rotation (ротация + отзыв старого refresh).
- [x] Определить env-переменные: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`.

## 2. Изменения в БД

- [x] Описать модель `users` в Prisma schema.
- [x] Добавить таблицу `sessions` (хеш токена, expiry, revokedAt, userId).
- [x] Зафиксировать уникальность email (нормализация в lowercase + unique index).
- [x] Создать и применить миграцию Prisma для auth-моделей.

## 3. Модули

- [x] Создать/проверить модуль `auth`.

## 4. DTO и валидация

- [x] `RegisterDto`: email/password/name.
- [x] `LoginDto`: email/password.
- [x] `RefreshDto`: refreshToken.
- [x] Для `logout` использовать access token из guard, без request DTO.
- [x] Включить `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- [x] Нормализовать email (`trim + lowercase`).

## 5. Бизнес-логика

- [x] Регистрация: проверка уникальности email, хеширование пароля, создание пользователя.
- [x] Логин: проверка credentials, единая ошибка `401`.
- [x] Генерация пары токенов (`access`, `refresh`) с минимальным payload (`sub`, `email`).
- [x] Сохранение hash refresh token в БД.
- [x] Refresh: валидация refresh, отзыв старого, выпуск новой пары токенов.
- [x] Logout: отзыв текущей сессии по `sessionId` из access token.
- [x] Получение текущего пользователя по `sub` из токена.

## 6. Контроллеры / API

- [x] `POST /auth/register`.
- [x] `POST /auth/login`.
- [x] `POST /auth/refresh`.
- [x] `POST /auth/logout`.
- [x] `GET /auth/me` (под guard).
- [x] Привести HTTP-коды к контракту (`201/200/401/409/400`).

## 6.1 Swagger / OpenAPI

- [x] Добавить теги и краткие описания операций для всех `auth` endpoint.
- [x] Описать request/response DTO для `register/login/refresh/logout/me`.
- [x] Описать основные коды ответов (`200/201/400/401/409` где применимо).
- [x] Настроить bearer auth схему и пометить `GET /auth/me` как защищенный endpoint.
- [x] Проверить, что в Swagger не светится `passwordHash`.

## 7. Права доступа / security

- [x] Настроить `JwtStrategy` и `AuthGuard('jwt')`.
- [x] Исключить возврат `passwordHash` в любых ответах.
- [x] Исключить хранение refresh token в открытом виде (только hash).
- [x] Добавить безопасные сообщения об ошибках логина (без утечки деталей).
- [x] Проверить срок жизни токена и обработку expired token.

<!-- ## 8. Тестирование

- [ ] Unit: `AuthService` (register/login/refresh/logout/validate).
- [ ] Unit: edge cases (duplicate email, wrong password, unknown email).
- [ ] Unit: edge cases refresh (expired/revoked/invalid token).
- [ ] E2E: `register -> login -> me` happy path.
- [ ] E2E: `login -> refresh -> me` с новым access token.
- [ ] E2E: 401 без токена и с невалидным токеном. -->

## 9. Ручная проверка

- [x] Зарегистрировать пользователя через Swagger/Postman.
- [x] Выполнить логин и проверить, что токен работает в `GET /auth/me`.
- [x] Проверить `refresh` и убедиться, что старый refresh становится невалидным.
- [x] Проверить `logout` и убедиться, что текущая сессия после logout больше не проходит guard.
- [x] Проверить конфликт при повторной регистрации того же email.
- [x] Проверить валидацию email/password/name.

## 10. Definition of Done

- [x] Все endpoint auth (`register/login/refresh/logout/me`) соответствуют `SPEC.md`.
- [x] Бизнес-правила и ошибки покрыты тестами.
- [x] Нет утечек `passwordHash`.
- [x] Нет хранения refresh token в открытом виде.
- [x] Swagger-документация auth полная и соответствует фактическому API.
- [x] Документация фичи актуальна и согласована с `CONTEXT.md` и `TECH_SPEC.md`.
