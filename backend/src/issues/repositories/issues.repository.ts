import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, issues } from '../../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IssueListScope } from '../issue.types';

type PrismaExecutor = PrismaService | Prisma.TransactionClient | PrismaClient;

@Injectable()
export class IssuesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTx(
    tx: Prisma.TransactionClient,
    data: Prisma.issuesCreateInput | Prisma.issuesUncheckedCreateInput,
  ) {
    return tx.issues.create({ data });
  }

  async update(issueId: string, data: Prisma.issuesUpdateInput | Prisma.issuesUncheckedUpdateInput) {
    return this.prisma.issues.update({
      where: { id: issueId },
      data,
    });
  }

  async updateTx(
    tx: Prisma.TransactionClient,
    issueId: string,
    data: Prisma.issuesUpdateInput | Prisma.issuesUncheckedUpdateInput,
  ) {
    return tx.issues.update({
      where: { id: issueId },
      data,
    });
  }

  async deleteTx(tx: Prisma.TransactionClient, issueId: string) {
    return tx.issues.delete({
      where: { id: issueId },
    });
  }

  async findByProjectAndId(projectId: string, issueId: string): Promise<issues | null> {
    return this.prisma.issues.findFirst({
      where: {
        id: issueId,
        project_id: projectId,
      },
    });
  }

  async findByIdTx(tx: Prisma.TransactionClient, issueId: string) {
    return tx.issues.findUnique({
      where: { id: issueId },
    });
  }

  async findBacklog(projectId: string): Promise<issues[]> {
    return this.prisma.issues.findMany({
      where: {
        project_id: projectId,
        sprint_id: null,
      },
      orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
    });
  }

  async listInScope(client: PrismaExecutor, scope: IssueListScope): Promise<issues[]> {
    return client.issues.findMany({
      where: this.buildScopeWhere(scope),
      orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
    });
  }

  async getNextPosition(client: PrismaExecutor, scope: IssueListScope): Promise<number> {
    const aggregate = await client.issues.aggregate({
      where: this.buildScopeWhere(scope),
      _max: {
        position: true,
      },
    });

    return (aggregate._max.position ?? -1) + 1;
  }

  scopeForIssue(issue: issues): IssueListScope {
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
      ...(scope.statusId !== undefined ? { status_id: scope.statusId } : {}),
    };
  }
}
