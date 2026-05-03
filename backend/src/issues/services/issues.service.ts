import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { AuthenticatedUser } from '../../auth/decorators/current-user.decorator';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { UpdateIssueDto } from '../dto/update-issue.dto';
import { MoveIssueToSprintDto } from '../dto/move-issue-to-sprint.dto';
import { ChangeIssueStatusDto } from '../dto/change-issue-status.dto';
import { ReorderIssueDto } from '../dto/reorder-issue.dto';
import { IssueResponse } from '../responses/issue.response';
import { IssueListScope } from '../issue.types';
import { IssuesAccessService } from './issues-access.service';
import { IssuesPositionService } from './issues-position.service';
import { IssuesRepository } from '../repositories/issues.repository';

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly issuesRepository: IssuesRepository,
    private readonly issuesAccessService: IssuesAccessService,
    private readonly issuesPositionService: IssuesPositionService,
  ) {}

  async create(
    projectId: string,
    user: AuthenticatedUser,
    dto: CreateIssueDto,
  ): Promise<IssueResponse> {
    const access = await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const defaultStatus = await this.issuesAccessService.getDefaultStatus(projectId);
    await this.issuesAccessService.validateAssignee(projectId, dto.assigneeId ?? null);

    const createdIssue = await this.prisma.$transaction(async (tx) => {
      const position = await this.issuesRepository.getNextPosition(tx, {
        projectId,
        sprintId: null,
      });

      return this.issuesRepository.createTx(tx, {
        project_id: projectId,
        sprint_id: null,
        status_id: defaultStatus.id,
        creator_id: access.member.user_id,
        assignee_id: dto.assigneeId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        type: dto.type,
        position,
      });
    });

    return this.toIssueResponse(createdIssue);
  }

  async getById(
    projectId: string,
    issueId: string,
    user: AuthenticatedUser,
  ): Promise<IssueResponse> {
    await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const issue = await this.issuesAccessService.getIssueOrThrow(projectId, issueId);

    return this.toIssueResponse(issue);
  }

  async update(
    projectId: string,
    issueId: string,
    user: AuthenticatedUser,
    dto: UpdateIssueDto,
  ): Promise<IssueResponse> {
    await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const issue = await this.issuesAccessService.getIssueOrThrow(projectId, issueId);

    if (dto.assigneeId !== undefined) {
      await this.issuesAccessService.validateAssignee(projectId, dto.assigneeId);
    }

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined && dto.title !== issue.title) {
      data.title = dto.title;
    }

    if (dto.description !== undefined && dto.description !== issue.description) {
      data.description = dto.description;
    }

    if (dto.type !== undefined && dto.type !== issue.type) {
      data.type = dto.type;
    }

    if (dto.assigneeId !== undefined && dto.assigneeId !== issue.assignee_id) {
      data.assignee_id = dto.assigneeId;
    }

    if (Object.keys(data).length === 0) {
      return this.toIssueResponse(issue);
    }

    const updatedIssue = await this.issuesRepository.update(issue.id, {
      ...data,
      updated_at: new Date(),
    });

    return this.toIssueResponse(updatedIssue);
  }

  async delete(projectId: string, issueId: string, user: AuthenticatedUser): Promise<void> {
    const access = await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const issue = await this.issuesAccessService.getIssueOrThrow(projectId, issueId);

    if (issue.creator_id !== user.id && access.project.owner_id !== user.id) {
      throw new ForbiddenException('Only issue creator or project owner can delete this issue');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.issuesRepository.deleteTx(tx, issue.id);
      await this.issuesPositionService.normalizeAfterDelete(tx, issue);
    });
  }

  async getBacklog(projectId: string, user: AuthenticatedUser): Promise<IssueResponse[]> {
    await this.issuesAccessService.getProjectAccess(projectId, user.id);

    const issuesList = await this.issuesRepository.findBacklog(projectId);

    return issuesList.map((issue) => this.toIssueResponse(issue));
  }

  async moveToSprint(
    projectId: string,
    issueId: string,
    user: AuthenticatedUser,
    dto: MoveIssueToSprintDto,
  ): Promise<IssueResponse> {
    await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const issue = await this.issuesAccessService.getIssueOrThrow(projectId, issueId);

    if (issue.sprint_id === dto.sprintId) {
      return this.toIssueResponse(issue);
    }

    if (dto.sprintId !== null) {
      await this.issuesAccessService.validateSprint(projectId, dto.sprintId);
    }

    const movedIssue = await this.prisma.$transaction(async (tx) => {
      const targetScope: IssueListScope =
        dto.sprintId === null
          ? {
              projectId,
              sprintId: null,
            }
          : {
              projectId,
              sprintId: dto.sprintId,
              statusId: issue.status_id,
            };

      return this.issuesPositionService.appendToScope(tx, issue, targetScope);
    });

    return this.toIssueResponse(movedIssue);
  }

  async changeStatus(
    projectId: string,
    issueId: string,
    user: AuthenticatedUser,
    dto: ChangeIssueStatusDto,
  ): Promise<IssueResponse> {
    await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const issue = await this.issuesAccessService.getIssueOrThrow(projectId, issueId);

    if (issue.sprint_id === null) {
      throw new ConflictException('Cannot change issue status outside sprint board');
    }

    if (issue.status_id === dto.statusId) {
      return this.toIssueResponse(issue);
    }

    await this.issuesAccessService.validateStatus(projectId, dto.statusId);

    const updatedIssue = await this.prisma.$transaction(async (tx) => {
      const targetScope: IssueListScope = {
        projectId,
        sprintId: issue.sprint_id,
        statusId: dto.statusId,
      };

      return this.issuesPositionService.appendToScope(tx, issue, targetScope);
    });

    return this.toIssueResponse(updatedIssue);
  }

  async reorder(
    projectId: string,
    issueId: string,
    user: AuthenticatedUser,
    dto: ReorderIssueDto,
  ): Promise<IssueResponse> {
    await this.issuesAccessService.getProjectAccess(projectId, user.id);
    const issue = await this.issuesAccessService.getIssueOrThrow(projectId, issueId);

    const reorderedIssue = await this.prisma.$transaction(async (tx) => {
      return this.issuesPositionService.reorder(tx, issue, dto.targetIndex);
    });

    return this.toIssueResponse(reorderedIssue);
  }

  private toIssueResponse(issue: Prisma.issuesGetPayload<Record<string, never>>): IssueResponse {
    return {
      id: issue.id,
      projectId: issue.project_id,
      sprintId: issue.sprint_id,
      statusId: issue.status_id,
      creatorId: issue.creator_id,
      assigneeId: issue.assignee_id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      position: issue.position,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    };
  }
}
