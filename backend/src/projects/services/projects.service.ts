import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Cacheable } from '../../infrastructure/cache/cache.decorator';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectResponse } from '../responses/project.response';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponse> {
    try {
      const project = await this.prisma.$transaction(async (tx) => {
        const createdProject = await tx.projects.create({
          data: {
            name: dto.name,
            project_key: dto.project_key,
            description: dto.description ?? null,
            owner_id: userId,
          },
        });

        await tx.project_members.create({
          data: {
            project_id: createdProject.id,
            user_id: userId,
            role: 'owner',
          },
        });

        await tx.statuses.createMany({
          data: [
            {
              project_id: createdProject.id,
              name: 'To Do',
              category: 'todo',
              position: 1,
              color: '#6B7280',
              is_default: true,
              is_final: false,
            },
            {
              project_id: createdProject.id,
              name: 'In Progress',
              category: 'in_progress',
              position: 2,
              color: '#3B82F6',
              is_default: false,
              is_final: false,
            },
            {
              project_id: createdProject.id,
              name: 'Done',
              category: 'done',
              position: 3,
              color: '#22C55E',
              is_default: false,
              is_final: true,
            },
          ],
        });

        return createdProject;
      });

      return this.toProjectResponse(project);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Project with this name or project key already exists');
      }

      throw error;
    }
  }

  @Cacheable(600) // кеш на 10 минут
  async findAllForUser(userId: string): Promise<ProjectResponse[]> {
    const projects = await this.prisma.projects.findMany({
      where: {
        deleted_at: null,
        project_members: {
          some: {
            user_id: userId,
            is_active: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return projects.map((project) => this.toProjectResponse(project));
  }

  @Cacheable(600) // кеш на 10 минут
  async findByIdForUser(projectId: string, userId: string): Promise<ProjectResponse> {
    await this.ensureProjectMember(projectId, userId);

    const project = await this.findProjectEntityOrThrow(projectId);

    return this.toProjectResponse(project);
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto): Promise<ProjectResponse> {
    const project = await this.ensureProjectOwner(projectId, userId);

    if (project.is_archived && dto.is_archived !== false) {
      throw new ConflictException('Archived project is read-only');
    }

    try {
      const updatedProject = await this.prisma.projects.update({
        where: {
          id: projectId,
        },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.is_archived !== undefined ? { is_archived: dto.is_archived } : {}),
          updated_at: new Date(),
        },
      });

      return this.toProjectResponse(updatedProject);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Project with this name already exists');
      }

      throw error;
    }
  }

  async archive(projectId: string, userId: string): Promise<ProjectResponse> {
    const project = await this.ensureProjectOwner(projectId, userId);

    if (project.is_archived) {
      return this.toProjectResponse(project);
    }

    const archivedProject = await this.prisma.projects.update({
      where: {
        id: projectId,
      },
      data: {
        is_archived: true,
        updated_at: new Date(),
      },
    });

    return this.toProjectResponse(archivedProject);
  }

  async ensureProjectMember(projectId: string, userId: string) {
    const project = await this.findProjectEntityOrThrow(projectId);

    const member = await this.prisma.project_members.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
        is_active: true,
      },
    });

    if (!member) {
      throw new ForbiddenException('User is not a project member');
    }

    return member;
  }

  async ensureProjectOwner(projectId: string, userId: string) {
    const project = await this.findProjectEntityOrThrow(projectId);

    if (project.owner_id !== userId) {
      throw new ForbiddenException('Only project owner can perform this action');
    }

    return project;
  }

  async ensureProjectWritable(projectId: string) {
    const project = await this.findProjectEntityOrThrow(projectId);

    if (project.is_archived) {
      throw new ConflictException('Archived project is read-only');
    }

    return project;
  }

  private async findProjectEntityOrThrow(projectId: string) {
    const project = await this.prisma.projects.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private toProjectResponse(project: {
    id: string;
    name: string;
    project_key: string;
    description: string | null;
    owner_id: string;
    is_archived: boolean;
    created_at: Date;
    updated_at: Date;
  }): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      project_key: project.project_key,
      description: project.description,
      owner_id: project.owner_id,
      is_archived: project.is_archived,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }
}
