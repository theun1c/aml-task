import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProjectMembersService } from '../services/project-members.service';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { ProjectMemberResponse } from '../responses/project-member.response';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
  sub?: string;
  user_id?: string;
};

@ApiTags('project-members')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:project_id/members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Get project members' })
  @ApiOkResponse({ type: ProjectMemberResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
  ): Promise<ProjectMemberResponse[]> {
    return this.projectMembersService.findAll(projectId, this.getUserId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Add user to project members' })
  @ApiCreatedResponse({ type: ProjectMemberResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project or user not found' })
  @ApiConflictResponse({ description: 'User is already a project member' })
  async addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Body() dto: AddProjectMemberDto,
  ): Promise<ProjectMemberResponse> {
    return this.projectMembersService.addMember(projectId, this.getUserId(user), dto);
  }

  @Delete(':user_id')
  @ApiOperation({ summary: 'Remove user from project members' })
  @ApiOkResponse({ type: ProjectMemberResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project member not found' })
  async removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('user_id') targetUserId: string,
  ): Promise<ProjectMemberResponse> {
    return this.projectMembersService.removeMember(projectId, this.getUserId(user), targetUserId);
  }

  private getUserId(user: AuthenticatedUser): string {
    return user.id ?? user.sub ?? user.user_id;
  }
}
