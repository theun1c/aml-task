import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from './projects.service';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { ProjectMemberResponse } from '../responses/project-member.response';

@Injectable()
export class ProjectMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async findAll(projectId: string, currentUserId: string): Promise<ProjectMemberResponse[]> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);

    const members = await this.prisma.project_members.findMany({
      where: {
        project_id: projectId,
        is_active: true,
      },
      include: {
        users: {
          select: {
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        joined_at: 'asc',
      },
    });

    return members.map((member) => this.toProjectMemberResponse(member));
  }

  async addMember(
    projectId: string,
    currentUserId: string,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMemberResponse> {
    await this.projectsService.ensureProjectOwner(projectId, currentUserId);
    await this.projectsService.ensureProjectWritable(projectId);

    const normalizedEmail = this.normalizeEmail(dto.email);

    const user = await this.prisma.users.findFirst({
      where: {
        email: normalizedEmail,
        deleted_at: null,
        is_active: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.prisma.project_members.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: user.id,
        },
      },
    });

    if (existingMember?.is_active) {
      throw new ConflictException('User is already a project member');
    }

    if (existingMember && !existingMember.is_active) {
      const restoredMember = await this.prisma.project_members.update({
        where: {
          id: existingMember.id,
        },
        data: {
          is_active: true,
          left_at: null,
          role: 'member',
          joined_at: new Date(),
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

      return this.toProjectMemberResponse(restoredMember);
    }

    const member = await this.prisma.project_members.create({
      data: {
        project_id: projectId,
        user_id: user.id,
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

    return this.toProjectMemberResponse(member);
  }

  async removeMember(
    projectId: string,
    currentUserId: string,
    targetUserId: string,
  ): Promise<ProjectMemberResponse> {
    const project = await this.projectsService.ensureProjectOwner(projectId, currentUserId);
    await this.projectsService.ensureProjectWritable(projectId);

    if (project.owner_id === targetUserId) {
      throw new ForbiddenException('Project owner cannot be removed');
    }

    const member = await this.prisma.project_members.findFirst({
      where: {
        project_id: projectId,
        user_id: targetUserId,
        is_active: true,
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

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    const removedMember = await this.prisma.project_members.update({
      where: {
        id: member.id,
      },
      data: {
        is_active: false,
        left_at: new Date(),
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

    return this.toProjectMemberResponse(removedMember);
  }

  private toProjectMemberResponse(member: {
    id: string;
    project_id: string;
    user_id: string;
    role: string;
    is_active: boolean;
    joined_at: Date;
    users?: {
      email: string;
      full_name: string;
    };
  }): ProjectMemberResponse {
    return {
      id: member.id,
      project_id: member.project_id,
      user_id: member.user_id,
      role: member.role,
      is_active: member.is_active,
      joined_at: member.joined_at,
      email: member.users?.email,
      full_name: member.users?.full_name,
    };
  }
}
