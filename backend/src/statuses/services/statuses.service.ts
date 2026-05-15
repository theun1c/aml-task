import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    await this.projectsService.ensureProjectWritable(projectId);

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
    await this.projectsService.ensureProjectWritable(projectId);

    const existingStatus = await this.findStatusEntityOrThrow(projectId, statusId);

    try {
      const shouldReorder =
        dto.position !== undefined && dto.position !== existingStatus.position;

      if (!shouldReorder) {
        const status = await this.prisma.statuses.update({
          where: {
            id: statusId,
          },
          data: {
            ...this.buildStatusUpdateData(dto),
            ...(dto.position !== undefined ? { position: dto.position } : {}),
            updated_at: new Date(),
          },
        });

        return this.toStatusResponse(status);
      }

      const status = await this.prisma.$transaction(async (tx) => {
        const statuses = await tx.statuses.findMany({
          where: {
            project_id: projectId,
          },
          orderBy: {
            position: 'asc',
          },
        });

        if (dto.position! < 1 || dto.position! > statuses.length) {
          throw new BadRequestException('Status position is out of range');
        }

        const reorderedStatusIds = statuses
          .filter((status) => status.id !== statusId)
          .map((status) => status.id);

        // Convert from 1-based position to 0-based index for array manipulation
        const arrayIndex = dto.position! - 1;
        reorderedStatusIds.splice(arrayIndex, 0, statusId);

        const now = new Date();
        const offset = statuses.length;
        let updatedStatus: (typeof statuses)[number] | null = null;

        for (const status of statuses) {
          await tx.statuses.update({
            where: {
              id: status.id,
            },
            data: {
              position: status.position + offset,
              updated_at: now,
            },
          });
        }

        for (const [position, reorderedStatusId] of reorderedStatusIds.entries()) {
          const reorderedStatus = await tx.statuses.update({
            where: {
              id: reorderedStatusId,
            },
            data: {
              position: position + 1,
              updated_at: now,
              ...(reorderedStatusId === statusId ? this.buildStatusUpdateData(dto) : {}),
            },
          });

          if (reorderedStatusId === statusId) {
            updatedStatus = reorderedStatus;
          }
        }

        if (!updatedStatus) {
          throw new NotFoundException('Status not found');
        }

        return updatedStatus;
      });

      return this.toStatusResponse(status);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Status with this name or position already exists in project');
      }

      throw error;
    }
  }

  async remove(projectId: string, statusId: string, userId: string): Promise<StatusResponse> {
    await this.projectsService.ensureProjectOwner(projectId, userId);
    await this.projectsService.ensureProjectWritable(projectId);

    await this.findStatusEntityOrThrow(projectId, statusId);

    try {
      const removedStatus = await this.prisma.$transaction(async (tx) => {
        const statuses = await tx.statuses.findMany({
          where: {
            project_id: projectId,
          },
          orderBy: {
            position: 'asc',
          },
        });

        if (statuses.length <= 1) {
          throw new ConflictException('Project must have at least one status');
        }

        const targetStatus = statuses.find((status) => status.id === statusId);

        if (!targetStatus) {
          throw new NotFoundException('Status not found');
        }

        const remainingStatuses = statuses.filter((status) => status.id !== statusId);
        const fallbackStatus = remainingStatuses[0];
        const now = new Date();

        await tx.issues.updateMany({
          where: {
            project_id: projectId,
            status_id: statusId,
            deleted_at: null,
          },
          data: {
            status_id: fallbackStatus.id,
            updated_at: now,
          },
        });

        if (targetStatus.is_default) {
          await tx.statuses.updateMany({
            where: {
              project_id: projectId,
              id: {
                not: statusId,
              },
            },
            data: {
              is_default: false,
              updated_at: now,
            },
          });

          await tx.statuses.update({
            where: {
              id: fallbackStatus.id,
            },
            data: {
              is_default: true,
              updated_at: now,
            },
          });
        }

        await tx.statuses.delete({
          where: {
            id: statusId,
          },
        });

        for (const [position, status] of remainingStatuses.entries()) {
          await tx.statuses.update({
            where: {
              id: status.id,
            },
            data: {
              position: position + 1,
              updated_at: now,
            },
          });
        }

        return targetStatus;
      });

      return this.toStatusResponse(removedStatus);
    } catch (error) {
      if (this.isForeignKeyConstraintError(error)) {
        throw new ConflictException(
          'Status cannot be deleted because it is referenced by related records',
        );
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

  private buildStatusUpdateData(dto: UpdateStatusDto) {
    return {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.category !== undefined ? { category: dto.category } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
      ...(dto.is_final !== undefined ? { is_final: dto.is_final } : {}),
    };
  }

  private isForeignKeyConstraintError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003';
  }
}
