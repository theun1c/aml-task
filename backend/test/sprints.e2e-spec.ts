/// <reference types="jest" />
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

jest.mock('../src/sprints/services/sprints.service', () => ({
  SprintsService: class SprintsService {},
}));

import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { SprintsController } from '../src/sprints/controllers/sprints.controller';
import { SprintsService } from '../src/sprints/services/sprints.service';

describe('SprintsController (e2e)', () => {
  let app: INestApplication;
  const authenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Name',
    sessionId: 'session-1',
  };
  const sprintsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findActive: jest.fn(),
    update: jest.fn(),
    start: jest.fn(),
    complete: jest.fn(),
    delete: jest.fn(),
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
  const projectId = '11111111-1111-4111-8111-111111111111';
  const sprintId = '22222222-2222-4222-8222-222222222222';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SprintsController],
      providers: [
        {
          provide: SprintsService,
          useValue: sprintsServiceMock,
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

  it('GET /api/projects/:project_id/sprints/:sprint_id should return sprint details', async () => {
    sprintsServiceMock.findById.mockResolvedValue({
      id: sprintId,
      project_id: projectId,
      name: 'Sprint 1',
      goal: null,
      status: 'planned',
      start_date: null,
      end_date: null,
      completed_at: null,
      created_at: '2026-05-11T10:00:00.000Z',
      updated_at: '2026-05-11T10:00:00.000Z',
    });

    await request(app.getHttpServer())
      .get(`/api/projects/${projectId}/sprints/${sprintId}`)
      .set('Authorization', 'Bearer test-access-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(sprintId);
        expect(body.project_id).toBe(projectId);
      });

    expect(sprintsServiceMock.findById).toHaveBeenCalledWith(projectId, sprintId, 'user-1');
  });

  it('PATCH /api/projects/:project_id/sprints/:sprint_id should return 400 for invalid sprint date', async () => {
    await request(app.getHttpServer())
      .patch(`/api/projects/${projectId}/sprints/${sprintId}`)
      .set('Authorization', 'Bearer test-access-token')
      .send({
        start_date: 'not-a-date',
      })
      .expect(400);
  });

  it('DELETE /api/projects/:project_id/sprints/:sprint_id should return 400 for invalid sprint uuid', async () => {
    await request(app.getHttpServer())
      .delete(`/api/projects/${projectId}/sprints/not-a-uuid`)
      .set('Authorization', 'Bearer test-access-token')
      .expect(400);
  });

  it('DELETE /api/projects/:project_id/sprints/:sprint_id should return success payload', async () => {
    sprintsServiceMock.delete.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/api/projects/${projectId}/sprints/${sprintId}`)
      .set('Authorization', 'Bearer test-access-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ success: true });
      });

    expect(sprintsServiceMock.delete).toHaveBeenCalledWith(projectId, sprintId, 'user-1');
  });
});
