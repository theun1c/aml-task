import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { SprintResponse } from '../responses/sprint.response';

@Injectable()
export class SprintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateSprintDto): Promise<SprintResponse> {
    await this.projectsService.ensureProjectMember(projectId, userId);

    try {
      const sprint = await this.prisma.sprints.create({
        data: {
          project_id: projectId,
          name: dto.name,
          goal: dto.goal ?? null,
          status: 'planned',
          start_date: dto.start_date ? new Date(dto.start_date) : null,
          end_date: dto.end_date ? new Date(dto.end_date) : null,
        },
      });

      return this.toSprintResponse(sprint);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Sprint with this name already exists in project');
      }

      throw error;
    }
  }

  async findAll(projectId: string, userId: string): Promise<SprintResponse[]> {
    await this.projectsService.ensureProjectMember(projectId, userId);

    const sprints = await this.prisma.sprints.findMany({
      where: {
        project_id: projectId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return sprints.map((sprint) => this.toSprintResponse(sprint));
  }

  async findActive(projectId: string, userId: string): Promise<SprintResponse | null> {
    await this.projectsService.ensureProjectMember(projectId, userId);

    const sprint = await this.prisma.sprints.findFirst({
      where: {
        project_id: projectId,
        status: 'active',
      },
    });

    return sprint ? this.toSprintResponse(sprint) : null;
  }

  async start(projectId: string, sprintId: string, userId: string): Promise<SprintResponse> {
    await this.projectsService.ensureProjectMember(projectId, userId);

    const sprint = await this.findSprintEntityOrThrow(projectId, sprintId);

    if (sprint.status !== 'planned') {
      throw new ConflictException('Only planned sprint can be started');
    }

    const activeSprint = await this.prisma.sprints.findFirst({
      where: {
        project_id: projectId,
        status: 'active',
      },
    });

    if (activeSprint) {
      throw new ConflictException('Project already has active sprint');
    }

    const updatedSprint = await this.prisma.sprints.update({
      where: {
        id: sprintId,
      },
      data: {
        status: 'active',
        start_date: sprint.start_date ?? new Date(),
        updated_at: new Date(),
      },
    });

    return this.toSprintResponse(updatedSprint);
  }

  async complete(projectId: string, sprintId: string, userId: string): Promise<SprintResponse> {
    await this.projectsService.ensureProjectMember(projectId, userId);

    const sprint = await this.findSprintEntityOrThrow(projectId, sprintId);

    if (sprint.status !== 'active') {
      throw new ConflictException('Only active sprint can be completed');
    }

    const finalStatus = await this.prisma.statuses.findFirst({
      where: {
        project_id: projectId,
        is_final: true,
      },
    });

    if (!finalStatus) {
      throw new ConflictException('Project final status is not configured');
    }

    const completedSprint = await this.prisma.$transaction(async (tx) => {
      const backlogMaxRank = await tx.issues.aggregate({
        where: {
          project_id: projectId,
          sprint_id: null,
          deleted_at: null,
        },
        _max: {
          rank_position: true,
        },
      });

      const unfinishedIssues = await tx.issues.findMany({
        where: {
          project_id: projectId,
          sprint_id: sprintId,
          status_id: {
            not: finalStatus.id,
          },
          deleted_at: null,
        },
        select: {
          id: true,
        },
        orderBy: [{ created_at: 'asc' }],
      });

      let nextRankPosition = this.getNextBacklogRankPosition(backlogMaxRank._max.rank_position);
      const updatedAt = new Date();

      for (const issue of unfinishedIssues) {
        await tx.issues.update({
          where: {
            id: issue.id,
          },
          data: {
            sprint_id: null,
            rank_position: nextRankPosition,
            updated_at: updatedAt,
          },
        });

        nextRankPosition += 1;
      }

      return tx.sprints.update({
        where: {
          id: sprintId,
        },
        data: {
          status: 'completed',
          completed_at: new Date(),
          updated_at: new Date(),
        },
      });
    });

    return this.toSprintResponse(completedSprint);
  }

  private async findSprintEntityOrThrow(projectId: string, sprintId: string) {
    const sprint = await this.prisma.sprints.findFirst({
      where: {
        id: sprintId,
        project_id: projectId,
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return sprint;
  }

  private toSprintResponse(sprint: {
    id: string;
    project_id: string;
    name: string;
    goal: string | null;
    status: string;
    start_date: Date | null;
    end_date: Date | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): SprintResponse {
    return {
      id: sprint.id,
      project_id: sprint.project_id,
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      completed_at: sprint.completed_at,
      created_at: sprint.created_at,
      updated_at: sprint.updated_at,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }

  private getNextBacklogRankPosition(rankPosition: { toString(): string } | number | null): number {
    if (rankPosition === null) {
      return 0;
    }

    if (typeof rankPosition === 'number') {
      return rankPosition + 1;
    }

    return Number(rankPosition.toString()) + 1;
  }
}
