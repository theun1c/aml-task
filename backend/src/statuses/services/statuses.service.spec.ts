import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { StatusesService } from './statuses.service';

type StatusRecord = {
  id: string;
  project_id: string;
  name: string;
  category: string;
  position: number;
  color: string | null;
  is_default: boolean;
  is_final: boolean;
  created_at: Date;
  updated_at: Date;
};

describe('StatusesService', () => {
  let service: StatusesService;
  let prisma: {
    statuses: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
    issues: {
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let tx: {
    statuses: {
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
    issues: {
      updateMany: jest.Mock;
    };
  };
  let projectsService: {
    ensureProjectOwner: jest.Mock;
    ensureProjectMember: jest.Mock;
    ensureProjectWritable: jest.Mock;
  };

  beforeEach(async () => {
    tx = {
      statuses: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      issues: {
        updateMany: jest.fn(),
      },
    };

    prisma = {
      statuses: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      issues: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (transaction: typeof tx) => unknown) =>
        callback(tx),
      ),
    };

    projectsService = {
      ensureProjectOwner: jest.fn(),
      ensureProjectMember: jest.fn(),
      ensureProjectWritable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusesService,
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

    service = module.get<StatusesService>(StatusesService);
  });

  it('should reorder statuses when position changes', async () => {
    const statusesState = createStatusesState([
      createStatusRecord('status-1', 1, {
        name: 'To Do',
        category: 'todo',
        is_default: true,
      }),
      createStatusRecord('status-2', 2, {
        name: 'Review',
        category: 'in_progress',
      }),
      createStatusRecord('status-3', 3, {
        name: 'Done',
        category: 'done',
        is_final: true,
      }),
    ]);

    projectsService.ensureProjectOwner.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    projectsService.ensureProjectWritable.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    prisma.statuses.findFirst.mockResolvedValue(statusesState.get('status-2'));
    prisma.statuses.update.mockResolvedValue({
      ...statusesState.get('status-2'),
      name: 'Ready for Review',
      position: 2,
    });
    tx.statuses.findMany.mockResolvedValue(getOrderedStatuses(statusesState));
    tx.statuses.update.mockImplementation(async ({ where, data }: { where: { id: string }; data: Partial<StatusRecord> }) => {
      const currentStatus = statusesState.get(where.id);
      const nextStatus = {
        ...currentStatus,
        ...data,
      } as StatusRecord;

      statusesState.set(where.id, nextStatus);

      return nextStatus;
    });

    const result = await service.update('project-1', 'status-2', 'owner-1', {
      name: 'Ready for Review',
      position: 1,
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.name).toBe('Ready for Review');
    expect(result.position).toBe(2);
    expect(getOrderedStatuses(statusesState).map((status) => status.id)).toEqual([
      'status-2',
      'status-1',
      'status-3',
    ]);
  });

  it('should delete status, move issues to first remaining column and keep positions compact', async () => {
    const statusesState = createStatusesState([
      createStatusRecord('status-1', 1, {
        name: 'To Do',
        category: 'todo',
        is_default: true,
      }),
      createStatusRecord('status-2', 2, {
        name: 'In Progress',
        category: 'in_progress',
      }),
      createStatusRecord('status-3', 3, {
        name: 'Done',
        category: 'done',
        is_final: true,
      }),
    ]);

    projectsService.ensureProjectOwner.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    projectsService.ensureProjectWritable.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    prisma.statuses.findFirst.mockResolvedValue(statusesState.get('status-1'));
    tx.statuses.findMany.mockResolvedValue(getOrderedStatuses(statusesState));
    tx.issues.updateMany.mockResolvedValue({ count: 2 });
    tx.statuses.updateMany.mockImplementation(async ({ where, data }: { where: { project_id: string; id?: { not: string } }; data: Partial<StatusRecord> }) => {
      for (const status of statusesState.values()) {
        if (status.project_id !== where.project_id) {
          continue;
        }

        if (where.id?.not !== undefined && status.id === where.id.not) {
          continue;
        }

        statusesState.set(status.id, {
          ...status,
          ...data,
        });
      }

      return { count: statusesState.size };
    });
    tx.statuses.update.mockImplementation(async ({ where, data }: { where: { id: string }; data: Partial<StatusRecord> }) => {
      const currentStatus = statusesState.get(where.id);
      const nextStatus = {
        ...currentStatus,
        ...data,
      } as StatusRecord;

      statusesState.set(where.id, nextStatus);

      return nextStatus;
    });
    tx.statuses.delete.mockImplementation(async ({ where }: { where: { id: string } }) => {
      const deletedStatus = statusesState.get(where.id);

      statusesState.delete(where.id);

      return deletedStatus;
    });

    const result = await (service as StatusesService & {
      remove: (projectId: string, statusId: string, userId: string) => Promise<StatusRecord>;
    }).remove('project-1', 'status-1', 'owner-1');

    expect(tx.issues.updateMany).toHaveBeenCalledWith({
      where: {
        project_id: 'project-1',
        status_id: 'status-1',
        deleted_at: null,
      },
      data: expect.objectContaining({
        status_id: 'status-2',
      }),
    });
    expect(result.id).toBe('status-1');
    expect(getOrderedStatuses(statusesState).map((status) => `${status.id}:${status.position}`)).toEqual([
      'status-2:1',
      'status-3:2',
    ]);
    expect(statusesState.get('status-2')?.is_default).toBe(true);
  });

  it('should reject deleting the last remaining status', async () => {
    projectsService.ensureProjectOwner.mockResolvedValue({
      id: 'project-1',
      owner_id: 'owner-1',
    });
    prisma.statuses.findFirst.mockResolvedValue(
      createStatusRecord('status-1', 1, {
        name: 'Only',
        category: 'todo',
        is_default: true,
      }),
    );
    tx.statuses.findMany.mockResolvedValue([
      createStatusRecord('status-1', 1, {
        name: 'Only',
        category: 'todo',
        is_default: true,
      }),
    ]);

    await expect(
      (service as StatusesService & {
        remove: (projectId: string, statusId: string, userId: string) => Promise<StatusRecord>;
      }).remove('project-1', 'status-1', 'owner-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function createStatusesState(statuses: StatusRecord[]): Map<string, StatusRecord> {
  return new Map(statuses.map((status) => [status.id, status]));
}

function getOrderedStatuses(statusesState: Map<string, StatusRecord>): StatusRecord[] {
  return Array.from(statusesState.values()).sort((left, right) => left.position - right.position);
}

function createStatusRecord(
  id: string,
  position: number,
  overrides?: Partial<StatusRecord>,
): StatusRecord {
  return {
    id,
    project_id: 'project-1',
    name: overrides?.name ?? `Status ${position}`,
    category: overrides?.category ?? 'todo',
    position,
    color: overrides?.color ?? null,
    is_default: overrides?.is_default ?? false,
    is_final: overrides?.is_final ?? false,
    created_at: new Date('2026-05-11T10:00:00.000Z'),
    updated_at: new Date('2026-05-11T10:00:00.000Z'),
  };
}
