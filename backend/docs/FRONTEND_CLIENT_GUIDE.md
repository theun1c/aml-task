# Frontend Client API Guide

This guide complements Swagger/OpenAPI and describes practical request flows for building the client UI.

## Base URL

Development API:

```text
http://localhost:3000/api
```

Swagger/OpenAPI:

```text
http://localhost:3000/api/docs
```

All protected endpoints require an access token in the `Authorization` header.

```http
Authorization: Bearer <access_token>
```

## Authentication Flow

### Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "email": "frontend@example.com",
  "password": "StrongPassword123!",
  "full_name": "Frontend Developer"
}
```

Response:

```json
{
  "access_token": "<jwt-access-token>",
  "refresh_token": "<jwt-refresh-token>",
  "user": {
    "id": "9d2f7b63-5f92-4a0d-9b91-2df8d32b6e87",
    "email": "frontend@example.com",
    "full_name": "Frontend Developer"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "frontend@example.com",
  "password": "StrongPassword123!"
}
```

Store the returned `access_token` and `refresh_token` on the client.

Recommended frontend behavior:

- Keep `access_token` in memory when possible.
- Keep `refresh_token` in secure persistent storage according to the client platform.
- Attach `Authorization: Bearer <access_token>` to all protected API calls.
- On `401 Unauthorized`, try `/auth/refresh` once, then repeat the original request.
- If refresh fails, clear tokens and redirect to the login screen.

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json
```

```json
{
  "refresh_token": "<jwt-refresh-token>"
}
```

Response:

```json
{
  "access_token": "<new-jwt-access-token>",
  "refresh_token": "<new-jwt-refresh-token>"
}
```

### Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

Use this request on app startup to validate the current session and load the user profile.

## Common Error Format

Validation and business errors are returned as standard NestJS HTTP errors.

Example validation error:

```json
{
  "message": [
    "title must be longer than or equal to 1 characters",
    "type_code must be one of the following values: bug, task, story"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Example business error:

```json
{
  "message": "User is not a project member",
  "error": "Forbidden",
  "statusCode": 403
}
```

Frontend handling:

- `400`: show field validation or request validation message.
- `401`: refresh token or redirect to login.
- `403`: show access denied state.
- `404`: show not found state.
- `409`: show conflict message, for example archived project or duplicate name.

## Main App Startup Flow

Recommended order after opening the application:

```text
1. GET /auth/me
2. GET /projects
3. Select the first project or restore project_id from route/local state
4. GET /projects/{project_id}
5. Load project-specific data for the current screen
```

Projects list:

```http
GET /projects
Authorization: Bearer <access_token>
```

Project details:

```http
GET /projects/{project_id}
Authorization: Bearer <access_token>
```

## Project Screen Loading

For a project overview page, load these resources:

```text
GET /projects/{project_id}
GET /projects/{project_id}/statuses
GET /projects/{project_id}/sprints
GET /projects/{project_id}/issues/backlog
```

These requests can be made in parallel after the frontend has a valid `project_id`.

## Backlog Flow

Load backlog issues:

```http
GET /projects/{project_id}/issues/backlog
Authorization: Bearer <access_token>
```

Create a backlog issue:

```http
POST /projects/{project_id}/issues
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Implement project board filters",
  "description": "Add quick filters for assignee and issue type",
  "type_code": "task",
  "assignee_id": null
}
```

Move an issue into a sprint:

```http
POST /projects/{project_id}/issues/{issue_id}/sprint
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "sprint_id": "2a9fdf71-d5a6-4c95-9b5d-0e6fbb2a0eb6"
}
```

Move an issue back to backlog:

```json
{
  "sprint_id": null
}
```

## Kanban Board Flow

For the kanban board, the frontend should load:

```text
GET /projects/{project_id}/statuses
GET /projects/{project_id}/sprints
GET /projects/{project_id}/issues/backlog
```

Recommended board state:

- Columns come from project statuses.
- Backlog issues have `sprint_id: null`.
- Active sprint issues are grouped by `status_id`.
- Dragging between columns calls the change status endpoint.
- Dragging inside one column calls the reorder endpoint.

Change issue status:

```http
PATCH /projects/{project_id}/issues/{issue_id}/status
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "status_id": "b52b48fc-7d7b-4f04-96fd-c54001136ad8"
}
```

Reorder issue:

```http
PATCH /projects/{project_id}/issues/{issue_id}/position
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "target_index": 2
}
```

Update issue fields:

```http
PATCH /projects/{project_id}/issues/{issue_id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Implement project board filters",
  "description": "Support assignee, status and type filters",
  "assignee_id": "47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53"
}
```

## Sprint Flow

Create sprint:

```http
POST /projects/{project_id}/sprints
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "name": "Sprint 1",
  "goal": "Prepare MVP for demo",
  "start_date": "2026-06-03",
  "end_date": "2026-06-17"
}
```

Start sprint:

```http
PATCH /projects/{project_id}/sprints/{sprint_id}/start
Authorization: Bearer <access_token>
```

Complete sprint:

```http
PATCH /projects/{project_id}/sprints/{sprint_id}/complete
Authorization: Bearer <access_token>
```

## Minimal Request Wrapper Example

```ts
const API_URL = 'http://localhost:3000/api';

async function apiRequest(path: string, options: RequestInit = {}) {
  const accessToken = tokenStore.getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    await refreshTokens();
    return apiRequest(path, options);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw error ?? { statusCode: response.status, message: response.statusText };
  }

  return response.json();
}
```

## Frontend Checklist

- Auth screens use `/auth/register`, `/auth/login`, `/auth/refresh`.
- Protected requests always send `Authorization: Bearer <access_token>`.
- App startup validates the session through `/auth/me`.
- Project pages load project, statuses, sprints and backlog.
- Backlog creates issues and moves them into sprints.
- Kanban board changes status and position through dedicated endpoints.
- Errors are handled by HTTP status code and `message`.
