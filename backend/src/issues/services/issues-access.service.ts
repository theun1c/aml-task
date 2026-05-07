import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { statuses } from '../../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { IssueTypeValue } from '../issue-type';
import { ProjectAccess } from '../issue.types';
import { IssuesRepository } from '../repositories/issues.repository';

@Injectable()
export class IssuesAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly issuesRepository: IssuesRepository,
  ) {}

  async getProjectAccess(projectId: string, userId: string): Promise<ProjectAccess> {
    const project = await this.prisma.projects.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project || project.deleted_at !== null) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.prisma.project_members.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
        is_active: true,
        left_at: null,
      },
    });

    if (!member) {
      throw new ForbiddenException('User is not a project member');
    }

    return {
      project,
      member,
    };
  }

  async getIssueOrThrow(projectId: string, issueId: string) {
    const issue = await this.issuesRepository.findByProjectAndId(projectId, issueId);

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  async getDefaultStatus(projectId: string): Promise<statuses> {
    const status = await this.prisma.statuses.findFirst({
      where: {
        project_id: projectId,
        is_default: true,
      },
    });

    if (!status) {
      throw new ConflictException('Project default status is not configured');
    }

    return status;
  }

  async validateAssignee(projectId: string, assigneeId: string | null | undefined): Promise<void> {
    if (assigneeId === undefined || assigneeId === null) {
      return;
    }

    const user = await this.prisma.users.findUnique({
      where: {
        id: assigneeId,
      },
    });

    if (!user || user.deleted_at !== null || !user.is_active) {
      throw new NotFoundException('Assignee not found');
    }

    const projectMember = await this.prisma.project_members.findFirst({
      where: {
        project_id: projectId,
        user_id: assigneeId,
        is_active: true,
        left_at: null,
      },
    });

    if (!projectMember) {
      throw new BadRequestException('Assignee must belong to the same project');
    }
  }

  async validateStatus(projectId: string, statusId: string): Promise<statuses> {
    const status = await this.prisma.statuses.findUnique({
      where: {
        id: statusId,
      },
    });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    if (status.project_id !== projectId) {
      throw new BadRequestException('Status must belong to the same project');
    }

    return status;
  }

  async validateSprint(projectId: string, sprintId: string): Promise<void> {
    const sprint = await this.prisma.sprints.findUnique({
      where: {
        id: sprintId,
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.project_id !== projectId) {
      throw new BadRequestException('Sprint must belong to the same project');
    }

    if (sprint.status === 'completed') {
      throw new ConflictException('Completed sprint does not accept new issues');
    }
  }

  async getIssueTypeOrThrow(typeCode: IssueTypeValue) {
    const issueType = await this.prisma.issue_types.findUnique({
      where: {
        code: typeCode,
      },
    });

    if (!issueType) {
      throw new ConflictException(`Issue type "${typeCode}" is not configured`);
    }

    return issueType;
  }
}
