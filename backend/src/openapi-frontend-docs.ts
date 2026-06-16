const TAGS: Record<string, { name: string; description: string }> = {
  health: {
    name: 'Служебные проверки',
    description: 'Проверка доступности backend-приложения.',
  },
  auth: {
    name: 'Авторизация',
    description: 'Регистрация, вход, refresh token, выход и активные сессии пользователя.',
  },
  users: {
    name: 'Пользователи',
    description: 'Профиль текущего пользователя и поиск пользователей для добавления в проект.',
  },
  issues: {
    name: 'Задачи',
    description: 'Создание, чтение, редактирование, удаление и перемещение задач.',
  },
  projects: {
    name: 'Проекты',
    description: 'Проекты, к которым пользователь имеет доступ.',
  },
  'project-members': {
    name: 'Участники проектов',
    description: 'Список участников проекта, добавление и удаление участников.',
  },
  statuses: {
    name: 'Статусы',
    description: 'Колонки kanban-доски проекта: To Do, In Progress, Done и пользовательские статусы.',
  },
  sprints: {
    name: 'Спринты',
    description: 'Планирование, запуск, завершение и удаление спринтов.',
  },
  comments: {
    name: 'Комментарии',
    description: 'Комментарии внутри задач.',
  },
};

type OperationDoc = {
  summary: string;
  description: string;
  success?: string;
};

const OPERATION_DOCS: Record<string, OperationDoc> = {
  'GET /api/health': {
    summary: 'Проверить доступность API',
    description:
      'Публичная ручка для проверки, что backend запущен и отвечает. Используется для healthcheck Docker/CI/CD и быстрой проверки сервера.',
    success: 'Возвращает `{ "status": "ok" }`, если приложение доступно.',
  },

  'POST /api/auth/register': {
    summary: 'Зарегистрировать пользователя',
    description:
      'Создаёт нового пользователя по email, паролю и имени. Фронтенд после успешного ответа должен сохранить access/refresh token и перевести пользователя в приложение.',
    success: 'Возвращает access token, refresh token и краткие данные пользователя.',
  },
  'POST /api/auth/login': {
    summary: 'Войти по email и паролю',
    description:
      'Проверяет учетные данные пользователя. Используйте на странице входа. При 401 нужно показать ошибку неверного email или пароля.',
    success: 'Возвращает новую пару access/refresh token и данные пользователя.',
  },
  'POST /api/auth/refresh': {
    summary: 'Обновить токены',
    description:
      'Вызывается фронтендом при истечении access token. Если refresh token невалиден, нужно очистить сессию и отправить пользователя на экран входа.',
    success: 'Возвращает новую пару access/refresh token.',
  },
  'GET /api/auth/me': {
    summary: 'Получить текущего пользователя',
    description:
      'Используйте при старте приложения, чтобы проверить access token и получить данные текущей сессии.',
    success: 'Возвращает id, email и имя текущего пользователя.',
  },
  'POST /api/auth/logout': {
    summary: 'Выйти из текущей сессии',
    description:
      'Отзывает текущую refresh-сессию. После успешного ответа фронтенд очищает локальные токены.',
    success: 'Возвращает `{ "success": true }`.',
  },
  'POST /api/auth/logout-all': {
    summary: 'Выйти со всех устройств',
    description:
      'Отзывает все активные refresh-сессии пользователя. Удобно для кнопки "Выйти везде".',
    success: 'Возвращает `{ "success": true }`.',
  },
  'GET /api/auth/sessions': {
    summary: 'Получить активные сессии',
    description:
      'Возвращает список активных refresh-сессий текущего пользователя для экрана безопасности.',
    success: 'Возвращает массив сессий пользователя.',
  },

  'GET /api/users/me': {
    summary: 'Получить профиль',
    description: 'Возвращает профиль текущего пользователя для страницы настроек аккаунта.',
    success: 'Возвращает id, email, имя, фамилию и связанные поля профиля.',
  },
  'PATCH /api/users/me': {
    summary: 'Обновить профиль',
    description:
      'Обновляет данные текущего пользователя. Используйте на форме редактирования профиля.',
    success: 'Возвращает обновленный профиль.',
  },
  'GET /api/users/search': {
    summary: 'Найти пользователей по email',
    description:
      'Поиск активных пользователей по фрагменту email. Используется при добавлении участника в проект.',
    success: 'Возвращает массив найденных пользователей.',
  },

  'POST /api/projects': {
    summary: 'Создать проект',
    description:
      'Создаёт проект и назначает текущего пользователя владельцем. После создания backend также создаёт базовые статусы проекта.',
    success: 'Возвращает созданный проект.',
  },
  'GET /api/projects': {
    summary: 'Получить мои проекты',
    description:
      'Возвращает проекты, где текущий пользователь является владельцем или участником. Обычно вызывается после авторизации.',
    success: 'Возвращает массив проектов.',
  },
  'GET /api/projects/{project_id}': {
    summary: 'Получить проект по id',
    description:
      'Возвращает детали проекта. Фронтенд вызывает при открытии страницы проекта.',
    success: 'Возвращает проект.',
  },
  'PATCH /api/projects/{project_id}': {
    summary: 'Обновить проект',
    description:
      'Обновляет название/описание проекта. Доступно владельцу проекта. Архивированный проект нельзя изменять.',
    success: 'Возвращает обновленный проект.',
  },
  'DELETE /api/projects/{project_id}': {
    summary: 'Архивировать проект',
    description:
      'Переводит проект в режим read-only. Данные остаются доступны для чтения, но изменения запрещаются.',
    success: 'Возвращает архивированный проект.',
  },

  'GET /api/projects/{project_id}/members': {
    summary: 'Получить участников проекта',
    description:
      'Возвращает список активных участников проекта. Используйте на странице настроек проекта или команды.',
    success: 'Возвращает массив участников проекта.',
  },
  'POST /api/projects/{project_id}/members': {
    summary: 'Добавить участника',
    description:
      'Добавляет пользователя в проект по user_id/email из request body. Доступно владельцу проекта.',
    success: 'Возвращает добавленного участника проекта.',
  },
  'DELETE /api/projects/{project_id}/members/{user_id}': {
    summary: 'Удалить участника',
    description:
      'Исключает пользователя из проекта. Доступно владельцу проекта.',
    success: 'Возвращает обновленную запись участника.',
  },

  'GET /api/projects/{project_id}/statuses': {
    summary: 'Получить статусы проекта',
    description:
      'Возвращает колонки kanban-доски проекта в порядке отображения. Нужна для backlog/board экранов.',
    success: 'Возвращает массив статусов.',
  },
  'POST /api/projects/{project_id}/statuses': {
    summary: 'Создать статус',
    description:
      'Создаёт новую колонку проекта. Доступно владельцу проекта.',
    success: 'Возвращает созданный статус.',
  },
  'PATCH /api/projects/{project_id}/statuses/{status_id}': {
    summary: 'Обновить статус',
    description:
      'Меняет название, позицию, цвет или категорию статуса. Используйте для настройки kanban-колонок.',
    success: 'Возвращает обновленный статус.',
  },
  'DELETE /api/projects/{project_id}/statuses/{status_id}': {
    summary: 'Удалить статус',
    description:
      'Удаляет колонку проекта и переносит связанные задачи в первую доступную колонку, если это разрешено бизнес-правилами.',
    success: 'Возвращает удаленный статус.',
  },

  'GET /api/projects/{project_id}/issues/backlog': {
    summary: 'Получить backlog задач',
    description:
      'Возвращает задачи проекта без sprint_id. Используйте на экране backlog и при планировании спринта.',
    success: 'Возвращает массив задач backlog.',
  },
  'POST /api/projects/{project_id}/issues': {
    summary: 'Создать задачу',
    description:
      'Создаёт задачу в backlog проекта. Backend сам назначает issue_number, начальный статус и позицию.',
    success: 'Возвращает созданную задачу.',
  },
  'GET /api/projects/{project_id}/issues/{issue_id}': {
    summary: 'Получить задачу',
    description:
      'Возвращает детали задачи для карточки или модального окна.',
    success: 'Возвращает задачу.',
  },
  'PATCH /api/projects/{project_id}/issues/{issue_id}': {
    summary: 'Обновить задачу',
    description:
      'Обновляет поля задачи: название, описание, тип или исполнителя.',
    success: 'Возвращает обновленную задачу.',
  },
  'DELETE /api/projects/{project_id}/issues/{issue_id}': {
    summary: 'Удалить задачу',
    description:
      'Мягко удаляет задачу. Номер задачи и история проекта при этом не должны ломаться.',
    success: 'Возвращает `{ "success": true }`.',
  },
  'POST /api/projects/{project_id}/issues/{issue_id}/sprint': {
    summary: 'Перенести задачу в спринт или backlog',
    description:
      'Передайте `sprint_id`, чтобы добавить задачу в спринт. Передайте `null`, чтобы вернуть задачу в backlog.',
    success: 'Возвращает задачу с обновленным sprint_id.',
  },
  'PATCH /api/projects/{project_id}/issues/{issue_id}/status': {
    summary: 'Изменить статус задачи',
    description:
      'Используйте при drag-and-drop между колонками активной sprint board. Для backlog-задач смена статуса ограничена.',
    success: 'Возвращает задачу с обновленным status_id.',
  },
  'PATCH /api/projects/{project_id}/issues/{issue_id}/position': {
    summary: 'Изменить позицию задачи',
    description:
      'Используйте при drag-and-drop внутри backlog или внутри текущей колонки board. Передайте целевой индекс.',
    success: 'Возвращает задачу с обновленной rank_position.',
  },

  'POST /api/projects/{project_id}/sprints': {
    summary: 'Создать спринт',
    description:
      'Создаёт planned sprint внутри проекта. Задачи можно добавить в спринт отдельной ручкой.',
    success: 'Возвращает созданный спринт.',
  },
  'GET /api/projects/{project_id}/sprints': {
    summary: 'Получить спринты проекта',
    description:
      'Возвращает planned, active и completed спринты проекта.',
    success: 'Возвращает массив спринтов.',
  },
  'GET /api/projects/{project_id}/sprints/active': {
    summary: 'Получить активный спринт',
    description:
      'Возвращает текущий active sprint проекта или `null`, если активного спринта нет.',
    success: 'Возвращает активный спринт или null.',
  },
  'GET /api/projects/{project_id}/sprints/{sprint_id}': {
    summary: 'Получить спринт по id',
    description:
      'Возвращает детали конкретного спринта.',
    success: 'Возвращает спринт.',
  },
  'PATCH /api/projects/{project_id}/sprints/{sprint_id}': {
    summary: 'Обновить planned sprint',
    description:
      'Обновляет только planned sprint. Active/completed спринты нельзя редактировать этим endpoint.',
    success: 'Возвращает обновленный спринт.',
  },
  'PATCH /api/projects/{project_id}/sprints/{sprint_id}/start': {
    summary: 'Запустить спринт',
    description:
      'Переводит planned sprint в active. В проекте может быть только один активный спринт.',
    success: 'Возвращает запущенный спринт.',
  },
  'PATCH /api/projects/{project_id}/sprints/{sprint_id}/complete': {
    summary: 'Завершить спринт',
    description:
      'Завершает active sprint. Незавершенные задачи возвращаются в backlog согласно бизнес-правилам.',
    success: 'Возвращает завершенный спринт.',
  },
  'DELETE /api/projects/{project_id}/sprints/{sprint_id}': {
    summary: 'Удалить planned sprint',
    description:
      'Удаляет только planned sprint. Его задачи возвращаются в backlog.',
    success: 'Возвращает `{ "success": true }`.',
  },

  'GET /api/projects/{project_id}/issues/{issue_id}/comments': {
    summary: 'Получить комментарии задачи',
    description:
      'Возвращает комментарии задачи в порядке создания.',
    success: 'Возвращает массив комментариев.',
  },
  'POST /api/projects/{project_id}/issues/{issue_id}/comments': {
    summary: 'Добавить комментарий',
    description:
      'Создаёт комментарий к задаче от имени текущего пользователя.',
    success: 'Возвращает созданный комментарий.',
  },
  'PATCH /api/projects/{project_id}/issues/{issue_id}/comments/{comment_id}': {
    summary: 'Обновить комментарий',
    description:
      'Позволяет автору комментария изменить текст.',
    success: 'Возвращает обновленный комментарий.',
  },
  'DELETE /api/projects/{project_id}/issues/{issue_id}/comments/{comment_id}': {
    summary: 'Удалить комментарий',
    description:
      'Позволяет автору комментария удалить свой комментарий.',
    success: 'Возвращает удаленный комментарий.',
  },
};

const METHODS = ['get', 'post', 'patch', 'delete', 'put'] as const;

export function enhanceOpenApiForFrontend(document: any) {
  document.info.description =
    'Русскоязычный OpenAPI-контракт для frontend-разработки AML-task. ' +
    'Payload и ответы используют snake_case. Защищенные endpoint требуют заголовок Authorization: Bearer <access_token>.';

  document.tags = Object.values(TAGS);

  for (const [path, pathItem] of Object.entries<any>(document.paths ?? {})) {
    for (const method of METHODS) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      operation.tags = operation.tags?.map((tag: string) => TAGS[tag]?.name ?? tag);

      const doc =
        OPERATION_DOCS[`${method.toUpperCase()} ${path}`] ??
        OPERATION_DOCS[`${method.toUpperCase()} /api${path}`];

      if (!doc) {
        continue;
      }

      operation.summary = doc.summary;
      operation.description = doc.description;

      const successResponse = operation.responses?.['200'] ?? operation.responses?.['201'];
      if (successResponse && doc.success) {
        successResponse.description = doc.success;
      }

      if (path === '/api/health' || path === '/health') {
        operation.responses = {
          '200': {
            description: 'Возвращает статус доступности API.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                  },
                  required: ['status'],
                },
                example: {
                  status: 'ok',
                },
              },
            },
          },
        };
      }
    }
  }

  return document;
}
