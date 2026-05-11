import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: {
    issues: {
      findFirst: jest.Mock;
    };
    comments: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let projectsService: {
    ensureProjectMember: jest.Mock;
    ensureProjectWritable: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      issues: {
        findFirst: jest.fn(),
      },
      comments: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    projectsService = {
      ensureProjectMember: jest.fn(),
      ensureProjectWritable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
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

    service = module.get<CommentsService>(CommentsService);
  });

  it('create() should trim comment content before persisting', async () => {
    projectsService.ensureProjectMember.mockResolvedValue(undefined);
    projectsService.ensureProjectWritable.mockResolvedValue(undefined);
    prisma.issues.findFirst.mockResolvedValue({
      id: 'issue-1',
      project_id: 'project-1',
    });
    prisma.comments.create.mockResolvedValue({
      id: 'comment-1',
      issue_id: 'issue-1',
      author_id: 'user-1',
      content: 'Trimmed content',
      created_at: new Date('2026-05-11T10:00:00.000Z'),
      updated_at: new Date('2026-05-11T10:00:00.000Z'),
      deleted_at: null,
      users: {
        email: 'user@example.com',
        full_name: 'User Name',
      },
    });

    const result = await service.create('project-1', 'issue-1', 'user-1', {
      content: '  Trimmed content  ',
    });

    expect(prisma.comments.create).toHaveBeenCalledWith({
      data: {
        issue_id: 'issue-1',
        author_id: 'user-1',
        content: 'Trimmed content',
      },
      include: {
        users: {
          select: {
            email: true,
            full_name: true,
          },
        },
      },
    });
    expect(result.content).toBe('Trimmed content');
  });

  it('update() should trim comment content before saving', async () => {
    projectsService.ensureProjectMember.mockResolvedValue(undefined);
    projectsService.ensureProjectWritable.mockResolvedValue(undefined);
    prisma.issues.findFirst.mockResolvedValue({
      id: 'issue-1',
      project_id: 'project-1',
    });
    prisma.comments.findFirst.mockResolvedValue({
      id: 'comment-1',
      issue_id: 'issue-1',
      author_id: 'user-1',
      content: 'Old content',
      created_at: new Date('2026-05-11T10:00:00.000Z'),
      updated_at: new Date('2026-05-11T10:00:00.000Z'),
      deleted_at: null,
    });
    prisma.comments.update.mockResolvedValue({
      id: 'comment-1',
      issue_id: 'issue-1',
      author_id: 'user-1',
      content: 'Updated content',
      created_at: new Date('2026-05-11T10:00:00.000Z'),
      updated_at: new Date('2026-05-11T11:00:00.000Z'),
      deleted_at: null,
      users: {
        email: 'user@example.com',
        full_name: 'User Name',
      },
    });

    const result = await service.update('project-1', 'issue-1', 'comment-1', 'user-1', {
      content: '  Updated content  ',
    });

    expect(prisma.comments.update).toHaveBeenCalledWith({
      where: {
        id: 'comment-1',
      },
      data: {
        content: 'Updated content',
        updated_at: expect.any(Date),
      },
      include: {
        users: {
          select: {
            email: true,
            full_name: true,
          },
        },
      },
    });
    expect(result.content).toBe('Updated content');
  });

  it('delete() should reject non-author user', async () => {
    projectsService.ensureProjectMember.mockResolvedValue(undefined);
    projectsService.ensureProjectWritable.mockResolvedValue(undefined);
    prisma.issues.findFirst.mockResolvedValue({
      id: 'issue-1',
      project_id: 'project-1',
    });
    prisma.comments.findFirst.mockResolvedValue({
      id: 'comment-1',
      issue_id: 'issue-1',
      author_id: 'user-2',
      content: 'Comment content',
      created_at: new Date('2026-05-11T10:00:00.000Z'),
      updated_at: new Date('2026-05-11T10:00:00.000Z'),
      deleted_at: null,
    });

    await expect(
      service.delete('project-1', 'issue-1', 'comment-1', 'user-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
