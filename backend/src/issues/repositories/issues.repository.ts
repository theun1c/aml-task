import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { rankPositionToNumber } from '../issue-db-mappers';
import { IssueEntity, IssueListScope, issueWithTypeInclude } from '../issue.types';

type PrismaExecutor = PrismaService | Prisma.TransactionClient | PrismaClient;

@Injectable()
export class IssuesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTx(
    tx: Prisma.TransactionClient,
    data: Prisma.issuesCreateInput | Prisma.issuesUncheckedCreateInput,
  ): Promise<IssueEntity> {
    return tx.issues.create({
      data,
      include: issueWithTypeInclude,
    });
  }

  async update(
    issueId: string,
    data: Prisma.issuesUpdateInput | Prisma.issuesUncheckedUpdateInput,
  ): Promise<IssueEntity> {
    return this.prisma.issues.update({
      where: { id: issueId },
      data,
      include: issueWithTypeInclude,
    });
  }

  async updateTx(
    tx: Prisma.TransactionClient,
    issueId: string,
    data: Prisma.issuesUpdateInput | Prisma.issuesUncheckedUpdateInput,
  ): Promise<IssueEntity> {
    return tx.issues.update({
      where: { id: issueId },
      data,
      include: issueWithTypeInclude,
    });
  }

  async deleteTx(tx: Prisma.TransactionClient, issueId: string) {
    return tx.issues.update({
      where: { id: issueId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async findByProjectAndId(projectId: string, issueId: string): Promise<IssueEntity | null> {
    return this.prisma.issues.findFirst({
      where: {
        id: issueId,
        project_id: projectId,
        deleted_at: null,
      },
      include: issueWithTypeInclude,
    });
  }

  async findByIdTx(tx: Prisma.TransactionClient, issueId: string): Promise<IssueEntity | null> {
    return tx.issues.findUnique({
      where: { id: issueId },
      include: issueWithTypeInclude,
    });
  }

  async findBacklog(projectId: string): Promise<IssueEntity[]> {
    return this.prisma.issues.findMany({
      where: {
        project_id: projectId,
        sprint_id: null,
        deleted_at: null,
      },
      include: issueWithTypeInclude,
      orderBy: [{ rank_position: 'asc' }, { created_at: 'asc' }],
    });
  }

  async listInScope(client: PrismaExecutor, scope: IssueListScope): Promise<IssueEntity[]> {
    return client.issues.findMany({
      where: this.buildScopeWhere(scope),
      include: issueWithTypeInclude,
      orderBy: [{ rank_position: 'asc' }, { created_at: 'asc' }],
    });
  }

  async getNextPosition(client: PrismaExecutor, scope: IssueListScope): Promise<number> {
    const aggregate = await client.issues.aggregate({
      where: this.buildScopeWhere(scope),
      _max: {
        rank_position: true,
      },
    });

    return Math.trunc(rankPositionToNumber(aggregate._max.rank_position)) + 1;
  }

  async getNextIssueNumber(client: PrismaExecutor, projectId: string): Promise<bigint> {
    const aggregate = await client.issues.aggregate({
      where: {
        project_id: projectId,
      },
      _max: {
        issue_number: true,
      },
    });

    return (aggregate._max.issue_number ?? BigInt(0)) + BigInt(1);
  }

  scopeForIssue(
    issue: Pick<IssueEntity, 'project_id' | 'sprint_id' | 'status_id'>,
  ): IssueListScope {
    return {
      projectId: issue.project_id,
      sprintId: issue.sprint_id,
      statusId: issue.sprint_id === null ? undefined : issue.status_id,
    };
  }

  private buildScopeWhere(scope: IssueListScope): Prisma.issuesWhereInput {
    return {
      project_id: scope.projectId,
      sprint_id: scope.sprintId,
      deleted_at: null,
      ...(scope.statusId !== undefined ? { status_id: scope.statusId } : {}),
    };
  }
}
