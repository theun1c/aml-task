import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectMembersService } from './project-members.service';
import { ProjectsService } from './projects.service';

describe('ProjectMembersService', () => {
  let service: ProjectMembersService;
  let prisma: {
    users: {
      findFirst: jest.Mock;
    };
    project_members: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let projectsService: {
    ensureProjectOwner: jest.Mock;
    ensureProjectMember: jest.Mock;
    ensureProjectWritable: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      users: {
        findFirst: jest.fn(),
      },
      project_members: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    projectsService = {
      ensureProjectOwner: jest.fn(),
      ensureProjectMember: jest.fn(),
      ensureProjectWritable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectMembersService,
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

    service = module.get<ProjectMembersService>(ProjectMembersService);
  });

  it('should add member by normalized email', async () => {
    projectsService.ensureProjectOwner.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    projectsService.ensureProjectWritable.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    prisma.users.findFirst.mockResolvedValue({
      id: 'user-2',
      email: 'member@example.com',
      full_name: 'Member User',
      deleted_at: null,
      is_active: true,
    });
    prisma.project_members.findUnique.mockResolvedValue(null);
    prisma.project_members.create.mockResolvedValue({
      id: 'member-link-1',
      project_id: 'project-1',
      user_id: 'user-2',
      role: 'member',
      is_active: true,
      joined_at: new Date('2026-05-11T10:00:00.000Z'),
      users: {
        email: 'member@example.com',
        full_name: 'Member User',
      },
    });

    const result = await service.addMember('project-1', 'owner-1', {
      email: '  MEMBER@example.com  ',
    });

    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: {
        email: 'member@example.com',
        deleted_at: null,
        is_active: true,
      },
    });
    expect(prisma.project_members.create).toHaveBeenCalledWith({
      data: {
        project_id: 'project-1',
        user_id: 'user-2',
        role: 'member',
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
    expect(result.email).toBe('member@example.com');
    expect(result.user_id).toBe('user-2');
  });

  it('should restore inactive member found by normalized email', async () => {
    projectsService.ensureProjectOwner.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    projectsService.ensureProjectWritable.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    prisma.users.findFirst.mockResolvedValue({
      id: 'user-2',
      email: 'member@example.com',
      full_name: 'Member User',
      deleted_at: null,
      is_active: true,
    });
    prisma.project_members.findUnique.mockResolvedValue({
      id: 'member-link-1',
      project_id: 'project-1',
      user_id: 'user-2',
      role: 'member',
      is_active: false,
      joined_at: new Date('2026-05-01T10:00:00.000Z'),
    });
    prisma.project_members.update.mockResolvedValue({
      id: 'member-link-1',
      project_id: 'project-1',
      user_id: 'user-2',
      role: 'member',
      is_active: true,
      joined_at: new Date('2026-05-11T10:00:00.000Z'),
      users: {
        email: 'member@example.com',
        full_name: 'Member User',
      },
    });

    const result = await service.addMember('project-1', 'owner-1', {
      email: 'MEMBER@example.com',
    });

    expect(prisma.project_members.findUnique).toHaveBeenCalledWith({
      where: {
        project_id_user_id: {
          project_id: 'project-1',
          user_id: 'user-2',
        },
      },
    });
    expect(prisma.project_members.update).toHaveBeenCalledWith({
      where: {
        id: 'member-link-1',
      },
      data: expect.objectContaining({
        is_active: true,
        left_at: null,
        role: 'member',
        joined_at: expect.any(Date),
      }),
      include: {
        users: {
          select: {
            email: true,
            full_name: true,
          },
        },
      },
    });
    expect(result.user_id).toBe('user-2');
  });
});
