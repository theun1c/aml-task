import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentResponse } from '../responses/comment.response';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    projectId: string,
    issueId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    await this.projectsService.ensureProjectMember(projectId, userId);
    await this.ensureIssueBelongsToProject(projectId, issueId);

    const comment = await this.prisma.comments.create({
      data: {
        issue_id: issueId,
        author_id: userId,
        content: dto.content,
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

    return this.toCommentResponse(comment);
  }

  async findAll(
    projectId: string,
    issueId: string,
    userId: string,
  ): Promise<CommentResponse[]> {
    await this.projectsService.ensureProjectMember(projectId, userId);
    await this.ensureIssueBelongsToProject(projectId, issueId);

    const comments = await this.prisma.comments.findMany({
      where: {
        issue_id: issueId,
        deleted_at: null,
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
        created_at: 'asc',
      },
    });

    return comments.map((comment) => this.toCommentResponse(comment));
  }

  async update(
    projectId: string,
    issueId: string,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    await this.projectsService.ensureProjectMember(projectId, userId);
    await this.ensureIssueBelongsToProject(projectId, issueId);

    const comment = await this.findCommentEntityOrThrow(issueId, commentId);

    if (comment.author_id !== userId) {
      throw new ForbiddenException('Only comment author can update this comment');
    }

    const updatedComment = await this.prisma.comments.update({
      where: {
        id: commentId,
      },
      data: {
        content: dto.content,
        updated_at: new Date(),
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

    return this.toCommentResponse(updatedComment);
  }

  async delete(
    projectId: string,
    issueId: string,
    commentId: string,
    userId: string,
  ): Promise<CommentResponse> {
    await this.projectsService.ensureProjectMember(projectId, userId);
    await this.ensureIssueBelongsToProject(projectId, issueId);

    const comment = await this.findCommentEntityOrThrow(issueId, commentId);

    if (comment.author_id !== userId) {
      throw new ForbiddenException('Only comment author can delete this comment');
    }

    const deletedComment = await this.prisma.comments.update({
      where: {
        id: commentId,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
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

    return this.toCommentResponse(deletedComment);
  }

  private async ensureIssueBelongsToProject(
    projectId: string,
    issueId: string,
  ) {
    const issue = await this.prisma.issues.findFirst({
      where: {
        id: issueId,
        project_id: projectId,
        deleted_at: null,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  private async findCommentEntityOrThrow(issueId: string, commentId: string) {
    const comment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        issue_id: issueId,
        deleted_at: null,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  private toCommentResponse(comment: {
    id: string;
    issue_id: string;
    author_id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    users?: {
      email: string;
      full_name: string;
    };
  }): CommentResponse {
    return {
      id: comment.id,
      issue_id: comment.issue_id,
      author_id: comment.author_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      deleted_at: comment.deleted_at,
      author_email: comment.users?.email,
      author_full_name: comment.users?.full_name,
    };
  }
}