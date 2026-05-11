import { ConflictException } from '@nestjs/common';

jest.mock('../../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { AuthenticatedUser } from '../../auth/decorators/current-user.decorator';
import { IssuesRepository } from '../repositories/issues.repository';
import { IssuesService } from './issues.service';
import { IssuesAccessService } from './issues-access.service';
import { IssuesPositionService } from './issues-position.service';

type PrismaMock = {
  sprints: {
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('IssuesService', () => {
  let service: IssuesService;
  let prisma: PrismaMock;
  let issuesRepository: jest.Mocked<IssuesRepository>;
  let issuesAccessService: {
    getProjectAccess: jest.Mock;
    getIssueOrThrow: jest.Mock;
    validateStatus: jest.Mock;
  };
  let issuesPositionService: {
    appendToScope: jest.Mock;
  };

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Name',
    sessionId: 'session-1',
  };

  beforeEach(() => {
    prisma = {
      sprints: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    issuesRepository = {} as jest.Mocked<IssuesRepository>;
    issuesAccessService = {
      getProjectAccess: jest.fn(),
      getIssueOrThrow: jest.fn(),
      validateStatus: jest.fn(),
    };
    issuesPositionService = {
      appendToScope: jest.fn(),
    };

    service = new IssuesService(
      prisma as unknown as PrismaService,
      issuesRepository,
      issuesAccessService as unknown as IssuesAccessService,
      issuesPositionService as unknown as IssuesPositionService,
    );
  });

  it('changeStatus() should reject issue from non-active sprint board', async () => {
    issuesAccessService.getProjectAccess.mockResolvedValue({
      member: {
        user_id: 'user-1',
      },
      project: {
        id: 'project-1',
        owner_id: 'owner-1',
      },
    });
    issuesAccessService.getIssueOrThrow.mockResolvedValue(
      createIssueEntity({
        sprint_id: 'sprint-1',
        status_id: 'status-1',
      }),
    );
    prisma.sprints.findUnique.mockResolvedValue({
      id: 'sprint-1',
      project_id: 'project-1',
      status: 'planned',
    });
    issuesAccessService.validateStatus.mockResolvedValue(undefined);
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({}),
    );
    issuesPositionService.appendToScope.mockResolvedValue(
      createIssueEntity({
        sprint_id: 'sprint-1',
        status_id: 'status-2',
      }),
    );

    let caughtError: unknown;

    try {
      await service.changeStatus('project-1', 'issue-1', currentUser, {
        status_id: 'status-2',
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ConflictException);
    expect((caughtError as Error).message).toBe('Cannot change issue status outside active sprint board');

    expect(issuesAccessService.validateStatus).not.toHaveBeenCalled();
    expect(issuesPositionService.appendToScope).not.toHaveBeenCalled();
  });
});

function createIssueEntity(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 'issue-1',
    issue_number: BigInt(1),
    project_id: 'project-1',
    sprint_id: 'sprint-1',
    status_id: 'status-1',
    reporter_id: 'user-1',
    assignee_id: null,
    title: 'Issue title',
    description: null,
    type_id: 1,
    rank_position: 0,
    created_at: new Date('2026-05-11T10:00:00.000Z'),
    updated_at: new Date('2026-05-11T10:00:00.000Z'),
    issue_types: {
      code: 'task',
    },
    ...overrides,
  };
}
