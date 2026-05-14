# CI/CD Deployment Checklist - 2 часа

## ✅ ШАГ 1: GitHub Secrets (15 минут)

Откройте GitHub repo → Settings → Secrets and variables → Actions

**Проверьте что все есть:**

```
✓ DOCKERHUB_USERNAME       = your_dockerhub_username
✓ DOCKERHUB_TOKEN          = your_dockerhub_token (personal access token)
✓ DOCKERHUB_BACKEND_REPO   = your_dockerhub_username/aml-backend
✓ SSH_HOST                 = your_prod_server_ip_or_domain
✓ SSH_USER                 = deploy_user (например: ubuntu)
✓ SSH_KEY                  = private SSH key content (из ~/.ssh/id_rsa)
✓ SSH_PORT                 = 22 (или ваш custom port)
```

**Как получить SSH_KEY:**
```bash
# На локальной машине:
cat ~/.ssh/id_rsa

# Скопировать полностью (включая BEGIN и END) в GitHub Secret
```

---

## ✅ ШАГ 2: Проверить prod server (45 минут)

**SSH на prod сервер:**
```bash
ssh -p YOUR_SSH_PORT YOUR_SSH_USER@YOUR_SSH_HOST
```

**Проверить структуру:**
```bash
# Должна быть папка с проектом
cd /opt/aml-task
ls -la

# Должны быть файлы:
# - .env.prod
# - docker-compose.prod.yaml
# - другие файлы проекта
```

**Проверить Docker:**
```bash
docker --version
docker compose --version
```

**Проверить .env.prod:**
```bash
cat .env.prod

# Должны быть установлены (измените на реальные):
# POSTGRES_PASSWORD=your_actual_password
# JWT_ACCESS_SECRET=your_actual_secret
# JWT_REFRESH_SECRET=your_actual_secret
```

---

## ✅ ШАГ 3: Тестовый pull образа (60 минут)

**На prod сервере:**
```bash
cd /opt/aml-task

# Логинимся в Docker Hub
echo "YOUR_DOCKERHUB_TOKEN" | docker login -u "YOUR_DOCKERHUB_USERNAME" --password-stdin

# Пробуем pull latest образа
docker compose --env-file .env.prod -f docker-compose.prod.yaml pull backend

# Должен скачаться без ошибок
```

**Если ошибка - проверить:**
- Токен Docker Hub актуален?
- Репо `DOCKERHUB_BACKEND_REPO` существует в Docker Hub?
- Образ `latest` там есть?

---

## ✅ ШАГ 4: Локальный тест (опционально, если есть время)

**На локальной машине в backend:**
```bash
# Обновить зависимости
npm install

# Проверить что код собирается
npm run build

# Локально можно запустить
docker build -t aml-backend:test .
docker run -e DATABASE_URL=... -p 3000:3000 aml-backend:test
```

---

## 🚀 ШАГ 5: Trigger CI/CD

**После того как всё готово:**

1. Commit в main с флагом `[deploy]`:
```bash
git add .
git commit -m "feat: add caching, logging, rabbitmq [deploy]"
git push origin main
```

2. GitHub Actions запустится автоматически

3. Можете мониторить в GitHub Actions tab

4. После успешного deploy проверить:
```bash
curl http://YOUR_PROD_URL/api/health
```

---

## ⚠️ Если что-то сломалось

**На prod сервере откатить:**
```bash
cd /opt/aml-task

# Получить тег предыдущей версии из логов:
docker ps
docker inspect aml_backend_api | grep sha

# Откатить вручную:
sed -i 's/^BACKEND_IMAGE_TAG=.*/BACKEND_IMAGE_TAG=sha-PREV_COMMIT/' .env.prod
docker compose --env-file .env.prod -f docker-compose.prod.yaml pull backend
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d --no-deps backend
```

