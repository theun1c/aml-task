import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { SprintsService } from './sprints.service';

describe('SprintsService', () => {
  let service: SprintsService;
  let prisma: {
    sprints: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    statuses: {
      findFirst: jest.Mock;
    };
    issues: {
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let projectsService: {
    ensureProjectMember: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      sprints: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      statuses: {
        findFirst: jest.fn(),
      },
      issues: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    projectsService = {
      ensureProjectMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: ProjectsService,
          useValue: projectsService,
        },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('start() should reject empty sprint without issues', async () => {
    projectsService.ensureProjectMember.mockResolvedValue(undefined);
    prisma.sprints.findFirst
      .mockResolvedValueOnce({
        id: 'sprint-1',
        project_id: 'project-1',
        name: 'Sprint 1',
        goal: null,
        status: 'planned',
        start_date: null,
        end_date: null,
        completed_at: null,
        created_at: new Date('2026-05-01T10:00:00.000Z'),
        updated_at: new Date('2026-05-01T11:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);
    prisma.issues.findFirst.mockResolvedValue(null);
    prisma.sprints.update.mockResolvedValue({
      id: 'sprint-1',
      project_id: 'project-1',
      name: 'Sprint 1',
      goal: null,
      status: 'active',
      start_date: new Date('2026-05-11T10:00:00.000Z'),
      end_date: null,
      completed_at: null,
      created_at: new Date('2026-05-01T10:00:00.000Z'),
      updated_at: new Date('2026-05-11T10:00:00.000Z'),
    });

    await expect(service.start('project-1', 'sprint-1', 'user-1')).rejects.toThrow(
      'Sprint must contain at least one issue before start',
    );
    expect(prisma.issues.findFirst).toHaveBeenCalledWith({
      where: {
        project_id: 'project-1',
        sprint_id: 'sprint-1',
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });
    expect(prisma.sprints.update).not.toHaveBeenCalled();
  });

  it('complete() should move unfinished sprint issues to backlog with appended rank positions', async () => {
    projectsService.ensureProjectMember.mockResolvedValue(undefined);
    prisma.sprints.findFirst.mockResolvedValue({
      id: 'sprint-1',
      project_id: 'project-1',
      name: 'Sprint 1',
      goal: null,
      status: 'active',
      start_date: null,
      end_date: null,
      completed_at: null,
      created_at: new Date('2026-05-01T10:00:00.000Z'),
      updated_at: new Date('2026-05-01T11:00:00.000Z'),
    });
    prisma.statuses.findFirst.mockResolvedValue({
      id: 'done-status',
    });

    const tx = {
      issues: {
        aggregate: jest.fn().mockResolvedValue({
          _max: {
            rank_position: 4,
          },
        }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'issue-2' },
          { id: 'issue-3' },
        ]),
        update: jest
          .fn()
          .mockResolvedValueOnce({ id: 'issue-2' })
          .mockResolvedValueOnce({ id: 'issue-3' }),
      },
      sprints: {
        update: jest.fn().mockResolvedValue({
          id: 'sprint-1',
          project_id: 'project-1',
          name: 'Sprint 1',
          goal: null,
          status: 'completed',
          start_date: null,
          end_date: null,
          completed_at: new Date('2026-05-02T10:00:00.000Z'),
          created_at: new Date('2026-05-01T10:00:00.000Z'),
          updated_at: new Date('2026-05-02T10:00:00.000Z'),
        }),
      },
    };

    prisma.$transaction.mockImplementation(async (callback: (value: typeof tx) => unknown) => {
      return callback(tx);
    });

    await service.complete('project-1', 'sprint-1', 'user-1');

    expect(tx.issues.aggregate).toHaveBeenCalledWith({
      where: {
        project_id: 'project-1',
        sprint_id: null,
        deleted_at: null,
      },
      _max: {
        rank_position: true,
      },
    });
    expect(tx.issues.findMany).toHaveBeenCalledWith({
      where: {
        project_id: 'project-1',
        sprint_id: 'sprint-1',
        status_id: {
          not: 'done-status',
        },
        deleted_at: null,
      },
      select: {
        id: true,
      },
      orderBy: [{ created_at: 'asc' }],
    });
    expect(tx.issues.update).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'issue-2',
      },
      data: expect.objectContaining({
        sprint_id: null,
        rank_position: 5,
        updated_at: expect.any(Date),
      }),
    });
    expect(tx.issues.update).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'issue-3',
      },
      data: expect.objectContaining({
        sprint_id: null,
        rank_position: 6,
        updated_at: expect.any(Date),
      }),
    });
  });
});
