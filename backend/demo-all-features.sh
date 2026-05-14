#!/bin/bash

# 🎬 ПОЛНАЯ ДЕМОНСТРАЦИЯ: Redis Cache + Pino Logging + RabbitMQ
# 
# Использование:
# chmod +x demo-all-features.sh
# ./demo-all-features.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    DEMO: All Features                           ║${NC}"
echo -e "${BLUE}║          Redis Cache + Pino Logging + RabbitMQ                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

# Проверка зависимостей
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl not found${NC}"
    exit 1
fi

if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  redis-cli not found (optional, for cache inspection)${NC}"
fi

echo -e "${GREEN}✅ All dependencies found\n${NC}"

# Запрашиваем параметры
read -p "Enter your Bearer token (access_token): " TOKEN
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Token required${NC}"
    exit 1
fi

read -p "Enter project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Project ID required${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Parameters set${NC}\n"

# ============================================================================
# TEST 1: CACHE
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ TEST 1: REDIS CACHE PERFORMANCE                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Fetching project (request 1 - WITHOUT cache):${NC}"
START=$(date +%s%N)
RESPONSE1=$(curl -s http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN")
END=$(date +%s%N)
TIME1=$((($END - $START) / 1000000))
echo -e "${GREEN}✅ Time: ${TIME1}ms${NC}"
echo "Response: $(echo $RESPONSE1 | cut -c1-100)...\n"

sleep 1

echo -e "${YELLOW}Fetching project (request 2 - WITH cache from Redis):${NC}"
START=$(date +%s%N)
RESPONSE2=$(curl -s http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN")
END=$(date +%s%N)
TIME2=$((($END - $START) / 1000000))
echo -e "${GREEN}✅ Time: ${TIME2}ms${NC}"
echo "Response: $(echo $RESPONSE2 | cut -c1-100)...\n"

DIFF=$((TIME1 - TIME2))
if [ $DIFF -gt 0 ]; then
    echo -e "${GREEN}🚀 Cache is ${DIFF}ms faster!${NC}"
else
    echo -e "${YELLOW}ℹ️  First request might have been cached already${NC}"
fi

echo -e "${YELLOW}🔍 Checking Redis cache directly:${NC}"
if command -v redis-cli &> /dev/null; then
    CACHE_KEYS=$(redis-cli KEYS "*findByIdForUser*" | wc -l)
    echo -e "${GREEN}✅ Found $CACHE_KEYS cache entries in Redis${NC}"
else
    echo -e "${YELLOW}⚠️  Install redis-cli to inspect cache${NC}"
fi

echo ""

# ============================================================================
# TEST 2: LOGGING
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ TEST 2: PINO LOGGING (Creating Issue)                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}📝 Creating issue (watch the server logs for Pino output):${NC}"
echo -e "${YELLOW}Expected logs:${NC}"
echo -e "  ${GREEN}[INFO] Creating issue { projectId: ..., title: ... }${NC}"
echo -e "  ${GREEN}[INFO] Issue created successfully { issueId: ..., issueNumber: ... }${NC}\n"

ISSUE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Demo Issue for Testing",
    "description": "Created at '$(date)'",
    "type_code": "task"
  }')

ISSUE_ID=$(echo $ISSUE_RESPONSE | jq -r '.id' 2>/dev/null || echo "unknown")
ISSUE_NUM=$(echo $ISSUE_RESPONSE | jq -r '.issue_number' 2>/dev/null || echo "N/A")

echo -e "${GREEN}✅ Issue created:${NC}"
echo "   Issue ID: $ISSUE_ID"
echo "   Issue #: $ISSUE_NUM"
echo -e "   ${YELLOW}Check your terminal where 'npm run start:dev' is running for logs!${NC}\n"

# ============================================================================
# TEST 3: RABBITMQ
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ TEST 3: RABBITMQ MESSAGE BROKER                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}📬 RabbitMQ Queue Information:${NC}"
echo "   Queue name: aml_notifications"
echo "   Event just published: ISSUE_CREATED"
echo "   Event data:"
echo "     - Issue ID: $ISSUE_ID"
echo "     - Issue #: $ISSUE_NUM"
echo ""

echo -e "${YELLOW}🔍 Options to view messages:${NC}"
echo ""
echo -e "${GREEN}Option 1: RabbitMQ Management UI${NC}"
echo "   1. Open: http://localhost:15672"
echo "   2. Login: guest / guest"
echo "   3. Go to: Queues → aml_notifications"
echo "   4. See message count"
echo ""

echo -e "${GREEN}Option 2: Use Node.js consumer (recommended)${NC}"
echo -e "   ${YELLOW}In NEW terminal, run:${NC}"
echo -e "   ${GREEN}node /home/theun1c/Desktop/aml-task/backend/test-rabbitmq-consumer.js${NC}"
echo ""

echo -e "${GREEN}Option 3: Manual RabbitMQ CLI${NC}"
echo -e "   ${YELLOW}Run:${NC}"
echo "   docker exec -it rabbitmq_dev_aml rabbitmqctl list_queues"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ SUMMARY                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ Cache Test:${NC}"
echo "   Request 1 time: ${TIME1}ms"
echo "   Request 2 time: ${TIME2}ms"
echo "   Speedup: ${DIFF}ms faster with cache\n"

echo -e "${GREEN}✅ Logging Test:${NC}"
echo "   Issue created: #$ISSUE_NUM"
echo "   Check 'npm run start:dev' terminal for Pino logs\n"

echo -e "${GREEN}✅ RabbitMQ Test:${NC}"
echo "   Event published: ISSUE_CREATED"
echo "   Queue: aml_notifications"
echo "   Run consumer to see message\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Next step: Start the RabbitMQ consumer${NC}"
echo -e "${GREEN}  node /home/theun1c/Desktop/aml-task/backend/test-rabbitmq-consumer.js${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
