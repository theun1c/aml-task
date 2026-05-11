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
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectResponse } from '../responses/project.response';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
  sub?: string;
  user_id?: string;
};

@ApiTags('projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ type: ProjectResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiConflictResponse({
    description: 'Project with this name or project key already exists',
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectResponse> {
    return this.projectsService.create(this.getUserId(user), dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user projects' })
  @ApiOkResponse({ type: ProjectResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMyProjects(@CurrentUser() user: AuthenticatedUser): Promise<ProjectResponse[]> {
    return this.projectsService.findAllForUser(this.getUserId(user));
  }

  @Get(':project_id')
  @ApiOperation({ summary: 'Get project by id' })
  @ApiOkResponse({ type: ProjectResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
  ): Promise<ProjectResponse> {
    return this.projectsService.findByIdForUser(projectId, this.getUserId(user));
  }

  @Patch(':project_id')
  @ApiOperation({ summary: 'Update project by id' })
  @ApiOkResponse({ type: ProjectResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({
    description: 'Project with this name already exists or archived project is read-only',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponse> {
    return this.projectsService.update(projectId, this.getUserId(user), dto);
  }

  @Delete(':project_id')
  @ApiOperation({ summary: 'Archive project by id' })
  @ApiOkResponse({ type: ProjectResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Only project owner can perform this action',
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('project_id') projectId: string,
  ): Promise<ProjectResponse> {
    return this.projectsService.archive(projectId, this.getUserId(user));
  }

  private getUserId(user: AuthenticatedUser): string {
    return user.id ?? user.sub ?? user.user_id;
  }
}
