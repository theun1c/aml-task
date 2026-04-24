/// <reference types="jest" />
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

jest.mock('../src/auth/services/auth.service', () => ({
  AuthService: class AuthService {},
}));

import { AuthController } from '../src/auth/controllers/auth.controller';
import { AuthService } from '../src/auth/services/auth.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const authenticatedUser = {
    id: 'auth-user-id',
    email: 'auth-user@example.com',
    name: 'Auth User',
    sessionId: 'session-123',
  };
  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logoutCurrentSession: jest.fn(),
    logoutAllSessions: jest.fn(),
    getSessions: jest.fn(),
  };
  const jwtAuthGuardMock = {
    canActivate: jest.fn((ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (authHeader !== 'Bearer test-access-token') {
        throw new UnauthorizedException('Unauthorized');
      }

      request.user = authenticatedUser;
      return true;
    }),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const moduleFixture: TestingModule = await moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/register should return 201 and auth payload for valid request', async () => {
    authServiceMock.register.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: {
        id: 'u1',
        email: 'user@example.com',
        name: 'User',
      },
    });

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'strongPass123',
        name: 'User Name',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          accessToken: 'access',
          refreshToken: 'refresh',
          user: {
            id: 'u1',
            email: 'user@example.com',
            name: 'User',
          },
        });
      });
  });

  it('POST /api/auth/register should return 400 for invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'strongPass123',
        name: 'User Name',
      })
      .expect(400);
  });

  it('POST /api/auth/login should return 200 and auth payload for valid request', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'access-login',
      refreshToken: 'refresh-login',
      user: {
        id: 'u2',
        email: 'login@example.com',
        name: 'Login User',
      },
    });

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'strongPass123',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          accessToken: 'access-login',
          refreshToken: 'refresh-login',
          user: {
            id: 'u2',
            email: 'login@example.com',
            name: 'Login User',
          },
        });
      });
  });

  it('POST /api/auth/refresh should return 400 when refreshToken is missing', async () => {
    await request(app.getHttpServer()).post('/api/auth/refresh').send({}).expect(400);
  });

  it('GET /api/auth/me should return 401 without access token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('GET /api/auth/me should return 200 and current user with valid access token', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer test-access-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
        });
      });
  });

  it('POST /api/auth/logout should return 401 without access token', async () => {
    await request(app.getHttpServer()).post('/api/auth/logout').expect(401);
  });

  it('POST /api/auth/logout should return 200 and revoke current session with valid access token', async () => {
    authServiceMock.logoutCurrentSession.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer test-access-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ success: true });
      });

    expect(authServiceMock.logoutCurrentSession).toHaveBeenCalledWith(authenticatedUser.sessionId);
  });
});
