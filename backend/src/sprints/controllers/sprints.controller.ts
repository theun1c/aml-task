import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { SprintsService } from '../services/sprints.service';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { SprintResponse } from '../responses/sprint.response';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
  sub?: string;
  user_id?: string;
};

@ApiTags('sprints')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:project_id/sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project sprint' })
  @ApiCreatedResponse({ type: SprintResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({ description: 'Sprint with this name already exists in project' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Body() dto: CreateSprintDto,
  ): Promise<SprintResponse> {
    return this.sprintsService.create(projectId, this.getUserId(user), dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get project sprints' })
  @ApiOkResponse({ type: SprintResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
  ): Promise<SprintResponse[]> {
    return this.sprintsService.findAll(projectId, this.getUserId(user));
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active project sprint' })
  @ApiOkResponse({ type: SprintResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
  ): Promise<SprintResponse | null> {
    return this.sprintsService.findActive(projectId, this.getUserId(user));
  }

  @Patch(':sprint_id/start')
  @ApiOperation({ summary: 'Start project sprint' })
  @ApiOkResponse({ type: SprintResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or sprint not found' })
  @ApiConflictResponse({
    description: 'Only planned sprint can be started or project already has active sprint',
  })
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('sprint_id') sprintId: string,
  ): Promise<SprintResponse> {
    return this.sprintsService.start(projectId, sprintId, this.getUserId(user));
  }

  @Patch(':sprint_id/complete')
  @ApiOperation({ summary: 'Complete project sprint' })
  @ApiOkResponse({ type: SprintResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or sprint not found' })
  @ApiConflictResponse({
    description: 'Only active sprint can be completed or project final status is not configured',
  })
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Param('sprint_id') sprintId: string,
  ): Promise<SprintResponse> {
    return this.sprintsService.complete(projectId, sprintId, this.getUserId(user));
  }

  private getUserId(user: AuthenticatedUser): string {
    return user.id ?? user.sub ?? user.user_id;
  }
}