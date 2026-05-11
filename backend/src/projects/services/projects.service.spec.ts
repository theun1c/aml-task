import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    projects: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    project_members: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      projects: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      project_members: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('archive() should mark project archived without setting deleted_at', async () => {
    prisma.projects.findFirst.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
      deleted_at: null,
    });
    prisma.projects.update.mockResolvedValue({
      id: 'project-1',
      name: 'AML Task Manager',
      project_key: 'AML',
      description: null,
      owner_id: 'owner-1',
      is_archived: true,
      created_at: new Date('2026-05-01T10:00:00.000Z'),
      updated_at: new Date('2026-05-01T11:00:00.000Z'),
    });

    await service.archive('project-1', 'owner-1');

    expect(prisma.projects.update).toHaveBeenCalledWith({
      where: {
        id: 'project-1',
      },
      data: expect.objectContaining({
        is_archived: true,
        updated_at: expect.any(Date),
      }),
    });
    expect(prisma.projects.update.mock.calls[0][0].data).not.toHaveProperty('deleted_at');
  });

  it('findByIdForUser() should still return archived project when it is not deleted', async () => {
    prisma.project_members.findFirst.mockResolvedValue({
      id: 'member-1',
      project_id: 'project-1',
      user_id: 'owner-1',
      is_active: true,
    });
    prisma.projects.findFirst
      .mockResolvedValueOnce({
        id: 'project-1',
        owner_id: 'owner-1',
        deleted_at: null,
        is_archived: true,
      })
      .mockResolvedValueOnce({
        id: 'project-1',
        name: 'AML Task Manager',
        project_key: 'AML',
        description: null,
        owner_id: 'owner-1',
        is_archived: true,
        created_at: new Date('2026-05-01T10:00:00.000Z'),
        updated_at: new Date('2026-05-01T11:00:00.000Z'),
      });

    const project = await service.findByIdForUser('project-1', 'owner-1');

    expect(project.is_archived).toBe(true);
  });
});
