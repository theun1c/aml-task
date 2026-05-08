import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { StatusResponse } from '../responses/status.response';

@Injectable()
export class StatusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async findAll(projectId: string, userId: string): Promise<StatusResponse[]> {
    await this.projectsService.ensureProjectMember(projectId, userId);

    const statuses = await this.prisma.statuses.findMany({
      where: {
        project_id: projectId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return statuses.map((status) => this.toStatusResponse(status));
  }

  async create(projectId: string, userId: string, dto: CreateStatusDto): Promise<StatusResponse> {
    await this.projectsService.ensureProjectOwner(projectId, userId);

    try {
      const status = await this.prisma.$transaction(async (tx) => {
        const lastStatus = await tx.statuses.findFirst({
          where: {
            project_id: projectId,
          },
          orderBy: {
            position: 'desc',
          },
        });

        return tx.statuses.create({
          data: {
            project_id: projectId,
            name: dto.name,
            category: dto.category,
            position: (lastStatus?.position ?? -1) + 1,
            color: dto.color ?? null,
            is_default: false,
            is_final: dto.is_final ?? false,
          },
        });
      });

      return this.toStatusResponse(status);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Status with this name or position already exists in project');
      }

      throw error;
    }
  }

  async update(
    projectId: string,
    statusId: string,
    userId: string,
    dto: UpdateStatusDto,
  ): Promise<StatusResponse> {
    await this.projectsService.ensureProjectOwner(projectId, userId);

    await this.findStatusEntityOrThrow(projectId, statusId);

    try {
      const status = await this.prisma.statuses.update({
        where: {
          id: statusId,
        },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.category !== undefined ? { category: dto.category } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.position !== undefined ? { position: dto.position } : {}),
          ...(dto.is_final !== undefined ? { is_final: dto.is_final } : {}),
          updated_at: new Date(),
        },
      });

      return this.toStatusResponse(status);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Status with this name or position already exists in project');
      }

      throw error;
    }
  }

  private async findStatusEntityOrThrow(projectId: string, statusId: string) {
    const status = await this.prisma.statuses.findFirst({
      where: {
        id: statusId,
        project_id: projectId,
      },
    });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    return status;
  }

  private toStatusResponse(status: {
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
  }): StatusResponse {
    return {
      id: status.id,
      project_id: status.project_id,
      name: status.name,
      category: status.category,
      position: status.position,
      color: status.color,
      is_default: status.is_default,
      is_final: status.is_final,
      created_at: status.created_at,
      updated_at: status.updated_at,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }
}
