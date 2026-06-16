import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

function buildRedocHtml() {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AML-task API для фронтенда</title>
    <style>
      body {
        margin: 0;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .api-header {
        background: #111827;
        color: #f9fafb;
        padding: 20px 32px;
        border-bottom: 1px solid #374151;
      }

      .api-header h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
      }

      .api-header p {
        max-width: 920px;
        margin: 0;
        color: #d1d5db;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <header class="api-header">
      <h1>AML-task API для фронтендера</h1>
      <p>
        Эта документация описывает REST API backend-приложения: авторизацию, проекты,
        участников, статусы, спринты, задачи и комментарии. Для защищённых запросов
        используйте JWT access token в заголовке Authorization: Bearer &lt;token&gt;.
      </p>
    </header>
    <redoc
      spec-url="/api/docs-json"
      hide-download-button="false"
      expand-responses="200,201"
      required-props-first="true"
      sort-props-alphabetically="true"
      theme='{"typography":{"fontFamily":"Inter, Segoe UI, sans-serif","headings":{"fontWeight":"700"}},"sidebar":{"backgroundColor":"#f9fafb"},"rightPanel":{"backgroundColor":"#111827"}}'
    ></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AML-task API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  app.getHttpAdapter().get('/api/docs/redoc', (_request, response) => {
    response.type('html').send(buildRedocHtml());
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
