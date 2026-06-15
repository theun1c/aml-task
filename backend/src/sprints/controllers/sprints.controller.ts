import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { SprintResponse } from '../responses/sprint.response';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SuccessResponse } from '../../auth/responses/success.response';

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
  @ApiBadRequestResponse({ description: 'Validation error or invalid sprint dates' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({
    description: 'Sprint with this name already exists in project or archived project is read-only',
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id', ParseUUIDPipe) projectId: string,
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
    @Param('project_id', ParseUUIDPipe) projectId: string,
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
    @Param('project_id', ParseUUIDPipe) projectId: string,
  ): Promise<SprintResponse | null> {
    return this.sprintsService.findActive(projectId, this.getUserId(user));
  }

  @Get(':sprint_id')
  @ApiOperation({ summary: 'Get project sprint by id' })
  @ApiOkResponse({ type: SprintResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or sprint not found' })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('sprint_id', ParseUUIDPipe) sprintId: string,
  ): Promise<SprintResponse> {
    return this.sprintsService.findById(projectId, sprintId, this.getUserId(user));
  }

  @Patch(':sprint_id')
  @ApiOperation({ summary: 'Update planned sprint' })
  @ApiOkResponse({ type: SprintResponse })
  @ApiBadRequestResponse({ description: 'Validation error or invalid sprint dates' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or sprint not found' })
  @ApiConflictResponse({
    description:
      'Archived project is read-only, only planned sprint can be updated or sprint name already exists in project',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('sprint_id', ParseUUIDPipe) sprintId: string,
    @Body() dto: UpdateSprintDto,
  ): Promise<SprintResponse> {
    return this.sprintsService.update(projectId, sprintId, this.getUserId(user), dto);
  }

  @Patch(':sprint_id/start')
  @ApiOperation({ summary: 'Start project sprint' })
  @ApiOkResponse({ type: SprintResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or sprint not found' })
  @ApiConflictResponse({
    description:
      'Archived project is read-only, only planned sprint can be started, project already has active sprint, or sprint has no issues',
  })
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('sprint_id', ParseUUIDPipe) sprintId: string,
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
    description:
      'Archived project is read-only, only active sprint can be completed or project final status is not configured',
  })
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('sprint_id', ParseUUIDPipe) sprintId: string,
  ): Promise<SprintResponse> {
    return this.sprintsService.complete(projectId, sprintId, this.getUserId(user));
  }

  @Delete(':sprint_id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete planned sprint' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or sprint not found' })
  @ApiConflictResponse({
    description: 'Archived project is read-only or only planned sprint can be deleted',
  })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('sprint_id', ParseUUIDPipe) sprintId: string,
  ): Promise<SuccessResponse> {
    await this.sprintsService.delete(projectId, sprintId, this.getUserId(user));

    return { success: true };
  }

  private getUserId(user: AuthenticatedUser): string {
    return user.id ?? user.sub ?? user.user_id;
  }
}
