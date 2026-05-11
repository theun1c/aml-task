/// <reference types="jest" />
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

jest.mock('../src/users/services/users.service', () => ({
  UsersService: class UsersService {},
}));

import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { UsersController } from '../src/users/controllers/users.controller';
import { UsersService } from '../src/users/services/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const authenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Name',
    sessionId: 'session-1',
  };
  const usersServiceMock = {
    getProfile: jest.fn(),
    searchByEmail: jest.fn(),
    updateProfile: jest.fn(),
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    })
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

  it('GET /api/users/me should return 401 without access token', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
  });

  it('GET /api/users/me should return current profile for authenticated user', async () => {
    usersServiceMock.getProfile.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
    });

    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer test-access-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          id: 'user-1',
          email: 'user@example.com',
          full_name: 'User Name',
        });
      });

    expect(usersServiceMock.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('GET /api/users/search should return 400 for too short email fragment', async () => {
    await request(app.getHttpServer())
      .get('/api/users/search')
      .set('Authorization', 'Bearer test-access-token')
      .query({
        email: 'x',
      })
      .expect(400);
  });

  it('PATCH /api/users/me should update profile for authenticated user', async () => {
    usersServiceMock.updateProfile.mockResolvedValue({
      id: 'user-1',
      email: 'updated@example.com',
      full_name: 'Updated User',
    });

    await request(app.getHttpServer())
      .patch('/api/users/me')
      .set('Authorization', 'Bearer test-access-token')
      .send({
        email: 'updated@example.com',
        full_name: 'Updated User',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          id: 'user-1',
          email: 'updated@example.com',
          full_name: 'Updated User',
        });
      });

    expect(usersServiceMock.updateProfile).toHaveBeenCalledWith('user-1', {
      email: 'updated@example.com',
      full_name: 'Updated User',
    });
  });
});
