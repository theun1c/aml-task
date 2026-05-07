import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { AuthenticatedUser } from '../../auth/decorators/current-user.decorator';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { UpdateIssueDto } from '../dto/update-issue.dto';
import { MoveIssueToSprintDto } from '../dto/move-issue-to-sprint.dto';
import { ChangeIssueStatusDto } from '../dto/change-issue-status.dto';
import { ReorderIssueDto } from '../dto/reorder-issue.dto';
import { mapIssueToResponse, rankPositionFromIndex } from '../issue-db-mappers';
import { IssueResponse } from '../responses/issue.response';
import { IssueEntity, IssueListScope } from '../issue.types';
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
    const issueType = await this.issuesAccessService.getIssueTypeOrThrow(dto.type_code);
    await this.issuesAccessService.validateAssignee(projectId, dto.assignee_id ?? null);

    const createdIssue = await this.prisma.$transaction(async (tx) => {
      const [position, issueNumber] = await Promise.all([
        this.issuesRepository.getNextPosition(tx, {
          projectId,
          sprintId: null,
        }),
        this.issuesRepository.getNextIssueNumber(tx, projectId),
      ]);

      return this.issuesRepository.createTx(tx, {
        project_id: projectId,
        issue_number: issueNumber,
        sprint_id: null,
        status_id: defaultStatus.id,
        reporter_id: access.member.user_id,
        assignee_id: dto.assignee_id ?? null,
        type_id: issueType.id,
        title: dto.title,
        description: dto.description ?? null,
        rank_position: rankPositionFromIndex(position),
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

    if (dto.assignee_id !== undefined) {
      await this.issuesAccessService.validateAssignee(projectId, dto.assignee_id);
    }

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined && dto.title !== issue.title) {
      data.title = dto.title;
    }

    if (dto.description !== undefined && dto.description !== issue.description) {
      data.description = dto.description;
    }

    if (dto.type_code !== undefined && dto.type_code !== issue.issue_types.code) {
      const issueType = await this.issuesAccessService.getIssueTypeOrThrow(dto.type_code);
      data.type_id = issueType.id;
    }

    if (dto.assignee_id !== undefined && dto.assignee_id !== issue.assignee_id) {
      data.assignee_id = dto.assignee_id;
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

    if (issue.reporter_id !== user.id && access.project.owner_id !== user.id) {
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

    if (issue.sprint_id === dto.sprint_id) {
      return this.toIssueResponse(issue);
    }

    if (dto.sprint_id !== null) {
      await this.issuesAccessService.validateSprint(projectId, dto.sprint_id);
    }

    const movedIssue = await this.prisma.$transaction(async (tx) => {
      const targetScope: IssueListScope =
        dto.sprint_id === null
          ? {
              projectId,
              sprintId: null,
            }
          : {
              projectId,
              sprintId: dto.sprint_id,
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

    if (issue.status_id === dto.status_id) {
      return this.toIssueResponse(issue);
    }

    await this.issuesAccessService.validateStatus(projectId, dto.status_id);

    const updatedIssue = await this.prisma.$transaction(async (tx) => {
      const targetScope: IssueListScope = {
        projectId,
        sprintId: issue.sprint_id,
        statusId: dto.status_id,
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
      return this.issuesPositionService.reorder(tx, issue, dto.target_index);
    });

    return this.toIssueResponse(reorderedIssue);
  }

  private toIssueResponse(issue: IssueEntity): IssueResponse {
    return mapIssueToResponse(issue);
  }
}
