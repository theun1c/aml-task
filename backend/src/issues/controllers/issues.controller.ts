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
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/decorators/current-user.decorator';
import { SuccessResponse } from '../../auth/responses/success.response';
import { IssuesService } from '../services/issues.service';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { UpdateIssueDto } from '../dto/update-issue.dto';
import { MoveIssueToSprintDto } from '../dto/move-issue-to-sprint.dto';
import { ChangeIssueStatusDto } from '../dto/change-issue-status.dto';
import { ReorderIssueDto } from '../dto/reorder-issue.dto';
import { IssueResponse } from '../responses/issue.response';

@ApiTags('issues')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:project_id/issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @ApiOperation({ summary: 'Create a new issue in project backlog' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiCreatedResponse({ type: IssueResponse })
  @ApiBadRequestResponse({ description: 'Validation error or invalid assignee' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or assignee not found' })
  @ApiConflictResponse({ description: 'Project default status is not configured' })
  @Post()
  create(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIssueDto,
  ) {
    return this.issuesService.create(projectId, user, dto);
  }

  @ApiOperation({ summary: 'Get backlog issues for a project' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiOkResponse({ type: IssueResponse, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @Get('backlog')
  getBacklog(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.issuesService.getBacklog(projectId, user);
  }

  @ApiOperation({ summary: 'Get issue details by id' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiParam({ name: 'issue_id', type: String })
  @ApiOkResponse({ type: IssueResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or issue not found' })
  @Get(':issue_id')
  getById(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('issue_id', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.issuesService.getById(projectId, issueId, user);
  }

  @ApiOperation({ summary: 'Update issue fields' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiParam({ name: 'issue_id', type: String })
  @ApiOkResponse({ type: IssueResponse })
  @ApiBadRequestResponse({ description: 'Validation error or invalid assignee' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project, issue or assignee not found' })
  @Patch(':issue_id')
  update(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('issue_id', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateIssueDto,
  ) {
    return this.issuesService.update(projectId, issueId, user, dto);
  }

  @ApiOperation({ summary: 'Delete issue by id' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiParam({ name: 'issue_id', type: String })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not allowed to delete this issue' })
  @ApiNotFoundResponse({ description: 'Project or issue not found' })
  @HttpCode(200)
  @Delete(':issue_id')
  async delete(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('issue_id', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.issuesService.delete(projectId, issueId, user);
    return { success: true };
  }

  @ApiOperation({ summary: 'Move issue to sprint or back to backlog' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiParam({ name: 'issue_id', type: String })
  @ApiOkResponse({ type: IssueResponse })
  @ApiBadRequestResponse({ description: 'Validation error or sprint belongs to another project' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project, issue or sprint not found' })
  @ApiConflictResponse({ description: 'Sprint cannot accept new issues' })
  @HttpCode(200)
  @Post(':issue_id/sprint')
  moveToSprint(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('issue_id', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MoveIssueToSprintDto,
  ) {
    return this.issuesService.moveToSprint(projectId, issueId, user, dto);
  }

  @ApiOperation({ summary: 'Change issue status inside sprint board' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiParam({ name: 'issue_id', type: String })
  @ApiOkResponse({ type: IssueResponse })
  @ApiBadRequestResponse({ description: 'Validation error or status belongs to another project' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project, issue or status not found' })
  @ApiConflictResponse({ description: 'Issue is not in active sprint board' })
  @Patch(':issue_id/status')
  changeStatus(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('issue_id', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangeIssueStatusDto,
  ) {
    return this.issuesService.changeStatus(projectId, issueId, user, dto);
  }

  @ApiOperation({ summary: 'Reorder issue inside backlog or current board column' })
  @ApiParam({ name: 'project_id', type: String })
  @ApiParam({ name: 'issue_id', type: String })
  @ApiOkResponse({ type: IssueResponse })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'User is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or issue not found' })
  @Patch(':issue_id/position')
  reorder(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('issue_id', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderIssueDto,
  ) {
    return this.issuesService.reorder(projectId, issueId, user, dto);
  }
}
