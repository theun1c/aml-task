import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
import { StatusesService } from '../services/statuses.service';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { StatusResponse } from '../responses/status.response';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
  sub?: string;
  user_id?: string;
};

@ApiTags('statuses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:project_id/statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Get project statuses' })
  @ApiOkResponse({ type: StatusResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
  ): Promise<StatusResponse[]> {
    return this.statusesService.findAll(projectId, this.getUserId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create project status' })
  @ApiCreatedResponse({ type: StatusResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({
    description: 'Status with this name or position already exists in project',
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Body() dto: CreateStatusDto,
  ): Promise<StatusResponse> {
    return this.statusesService.create(projectId, this.getUserId(user), dto);
  }

  @Patch(':status_id')
  @ApiOperation({ summary: 'Update project status' })
  @ApiOkResponse({ type: StatusResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project or status not found' })
  @ApiConflictResponse({
    description: 'Status with this name or position already exists in project',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('status_id') statusId: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<StatusResponse> {
    return this.statusesService.update(projectId, statusId, this.getUserId(user), dto);
  }

  @Delete(':status_id')
  @ApiOperation({ summary: 'Delete project status and move its issues to the first remaining column' })
  @ApiOkResponse({ type: StatusResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project or status not found' })
  @ApiConflictResponse({
    description:
      'Project must have at least one status or status is referenced by related records',
  })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('status_id') statusId: string,
  ): Promise<StatusResponse> {
    return this.statusesService.remove(projectId, statusId, this.getUserId(user));
  }

  private getUserId(user: AuthenticatedUser): string {
    return user.id ?? user.sub ?? user.user_id;
  }
}
