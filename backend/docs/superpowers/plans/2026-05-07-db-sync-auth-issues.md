# Auth And Issues DB Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the current backend code in line with the introspected PostgreSQL schema, keeping Prisma/database names authoritative while preserving the existing public API unless a documented mismatch requires change.

**Architecture:** First stabilize `auth` against `users` and `user_sessions`, because that module already has tests and partial migration work in progress. Then adapt `issues` to the real `issues`, `issue_types`, `statuses`, and `sprints` tables by isolating schema-specific mapping logic in small helpers and service/repository updates. Finally update docs to reflect the actual schema and API behavior.

**Tech Stack:** NestJS, TypeScript, Prisma, PostgreSQL, Jest, Swagger/OpenAPI

---

### Task 1: Stabilize Auth Against `users` / `user_sessions`

**Files:**
- Modify: `src/auth/auth.service.spec.ts`
- Modify: `src/auth/services/auth.service.ts`
- Modify: `src/auth/strategies/jwt.strategy.ts`

- [ ] **Step 1: Write failing auth tests for current schema names**

Add expectations that use `user_sessions` and `full_name`, not `sessions` and `name`.

- [ ] **Step 2: Run auth unit tests to verify they fail for the expected reason**

Run: `npm test -- --runInBand auth.service.spec.ts`
Expected: FAIL because the current mock/test shape still uses old schema names.

- [ ] **Step 3: Implement the minimal auth sync**

Update service and strategy usage so they consistently work with:
- `users.full_name`
- `user_sessions`
- session revocation fields from the real schema

- [ ] **Step 4: Run auth unit tests to verify they pass**

Run: `npm test -- --runInBand auth.service.spec.ts auth.controller.spec.ts`
Expected: PASS

### Task 2: Add a Small Tested Mapping Layer for Issue Types / Rank Positions

**Files:**
- Create: `src/issues/issue-db-mappers.ts`
- Create: `src/issues/issue-db-mappers.spec.ts`

- [ ] **Step 1: Write failing mapper tests**

Cover:
- `issue_types.code -> API type`
- `rank_position Decimal | null -> numeric API position`
- `reporter_id -> creatorId` response mapping

- [ ] **Step 2: Run mapper tests to verify they fail**

Run: `npm test -- --runInBand issues/issue-db-mappers.spec.ts`
Expected: FAIL because helper file behavior does not exist yet.

- [ ] **Step 3: Implement minimal mappers**

Add small pure helpers that:
- translate DB issue type rows/codes into MVP `task | bug`
- normalize rank positions for API responses and reorder logic

- [ ] **Step 4: Run mapper tests to verify they pass**

Run: `npm test -- --runInBand issues/issue-db-mappers.spec.ts`
Expected: PASS

### Task 3: Sync `issues` Service / Repository With Real Prisma Schema

**Files:**
- Modify: `src/issues/issue-type.ts`
- Modify: `src/issues/issue.types.ts`
- Modify: `src/issues/repositories/issues.repository.ts`
- Modify: `src/issues/services/issues-access.service.ts`
- Modify: `src/issues/services/issues-position.service.ts`
- Modify: `src/issues/services/issues.service.ts`
- Modify: `src/issues/responses/issue.response.ts`

- [ ] **Step 1: Write or extend focused failing tests around new issue schema assumptions**

Add tests around the new mapper helpers and any service logic that depends on:
- `reporter_id`
- `type_id`
- `rank_position`
- string sprint statuses from DB

- [ ] **Step 2: Run the focused issue tests / build to verify red**

Run: `npm run build`
Expected: FAIL on old field names like `creator_id`, `type`, `position`, and removed enum exports.

- [ ] **Step 3: Implement minimal schema-aligned issue changes**

Update issue flows to:
- create and read `reporter_id`
- resolve `type_id` through `issue_types`
- use `rank_position` instead of `position`
- compare sprint status using real DB values
- map DB entity fields back into the existing response DTO

- [ ] **Step 4: Run build to verify green**

Run: `npm run build`
Expected: PASS

### Task 4: Document Confirmed Mismatches

**Files:**
- Modify: `docs/ai/features/001-auth/SPEC.md`
- Modify: `docs/ai/features/001-auth/TASKS.md`
- Modify: `docs/ai/features/002-issues/SPEC.md`
- Modify: `docs/ai/features/002-issues/TASKS.md`
- Modify: `docs/ai/CONTEXT.md`
- Modify: `docs/product/TECH_SPEC.md`

- [ ] **Step 1: Update docs only where a mismatch was confirmed by code + DB**

Capture:
- `user_sessions` vs legacy `refresh_tokens/sessions` naming
- `full_name`
- `issues.type_id + issue_types`
- `issues.rank_position`
- widened DB schema beyond MVP

- [ ] **Step 2: Re-read docs and make sure they no longer contradict code or Prisma**

Run: `rg -n "creatorId|creator_id|position|issue_type|refresh_tokens|sessions" docs src`
Expected: only intentional usages remain.

### Task 5: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run unit tests and build**

Run: `npm test -- --runInBand auth.service.spec.ts auth.controller.spec.ts issues/issue-db-mappers.spec.ts`
Expected: PASS

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Run a final mismatch scan**

Run: `rg -n "creator_id|position:|issue_type|sprint_status|prisma\\.sessions\\b" src`
Expected: no stale pre-introspection schema usage remains in active code.
