import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentResponse } from '../responses/comment.response';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
  sub?: string;
  user_id?: string;
};

@ApiTags('comments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:project_id/issues/:issue_id/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create issue comment' })
  @ApiCreatedResponse({ type: CommentResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or issue not found' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('issue_id') issueId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    return this.commentsService.create(
      projectId,
      issueId,
      this.getUserId(user),
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get issue comments' })
  @ApiOkResponse({ type: CommentResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or issue not found' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('issue_id') issueId: string,
  ): Promise<CommentResponse[]> {
    return this.commentsService.findAll(
      projectId,
      issueId,
      this.getUserId(user),
    );
  }

  @Patch(':comment_id')
  @ApiOperation({ summary: 'Update issue comment' })
  @ApiOkResponse({ type: CommentResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'User is not a project member or is not comment author',
  })
  @ApiNotFoundResponse({ description: 'Project, issue or comment not found' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('issue_id') issueId: string,
    @Param('comment_id') commentId: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    return this.commentsService.update(
      projectId,
      issueId,
      commentId,
      this.getUserId(user),
      dto,
    );
  }

  @Delete(':comment_id')
  @ApiOperation({ summary: 'Delete issue comment' })
  @ApiOkResponse({ type: CommentResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'User is not a project member or is not comment author',
  })
  @ApiNotFoundResponse({ description: 'Project, issue or comment not found' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('issue_id') issueId: string,
    @Param('comment_id') commentId: string,
  ): Promise<CommentResponse> {
    return this.commentsService.delete(
      projectId,
      issueId,
      commentId,
      this.getUserId(user),
    );
  }

  private getUserId(user: AuthenticatedUser): string {
    return user.id ?? user.sub ?? user.user_id;
  }
}