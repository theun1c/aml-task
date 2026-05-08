import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { rankPositionFromIndex, rankPositionToNumber } from '../issue-db-mappers';
import { IssueEntity, IssueListScope } from '../issue.types';
import { IssuesRepository } from '../repositories/issues.repository';

@Injectable()
export class IssuesPositionService {
  constructor(private readonly issuesRepository: IssuesRepository) {}

  async appendToScope(
    tx: Prisma.TransactionClient,
    issue: IssueEntity,
    targetScope: IssueListScope,
  ) {
    const sourceScope = this.issuesRepository.scopeForIssue(issue);
    const nextPosition = await this.issuesRepository.getNextPosition(tx, targetScope);

    const data: Prisma.issuesUncheckedUpdateInput = {
      rank_position: rankPositionFromIndex(nextPosition),
      updated_at: new Date(),
    };

    if (targetScope.sprintId !== issue.sprint_id) {
      data.sprint_id = targetScope.sprintId;
    }

    if (targetScope.statusId !== undefined && targetScope.statusId !== issue.status_id) {
      data.status_id = targetScope.statusId;
    }

    const updatedIssue = await this.issuesRepository.updateTx(tx, issue.id, data);

    await this.normalizePositions(tx, sourceScope);

    if (!this.isSameScope(sourceScope, targetScope)) {
      await this.normalizePositions(tx, targetScope);
    }

    return updatedIssue;
  }

  async reorder(tx: Prisma.TransactionClient, issue: IssueEntity, targetIndex: number) {
    const scope = this.issuesRepository.scopeForIssue(issue);
    const issuesList = await this.issuesRepository.listInScope(tx, scope);
    const ids = issuesList.map((item) => item.id);
    const currentIndex = ids.indexOf(issue.id);

    if (currentIndex === -1) {
      throw new NotFoundException('Issue not found in reorder scope');
    }

    const normalizedTargetIndex = Math.min(targetIndex, ids.length - 1);

    if (currentIndex === normalizedTargetIndex) {
      const currentIssue = await this.issuesRepository.findByIdTx(tx, issue.id);

      if (!currentIssue) {
        throw new NotFoundException('Issue not found');
      }

      return currentIssue;
    }

    const [movedId] = ids.splice(currentIndex, 1);
    ids.splice(Math.min(targetIndex, ids.length), 0, movedId);

    for (const [index, id] of ids.entries()) {
      await this.issuesRepository.updateTx(tx, id, {
        rank_position: rankPositionFromIndex(index),
        updated_at: new Date(),
      });
    }

    const reorderedIssue = await this.issuesRepository.findByIdTx(tx, issue.id);

    if (!reorderedIssue) {
      throw new NotFoundException('Issue not found');
    }

    return reorderedIssue;
  }

  async normalizeAfterDelete(tx: Prisma.TransactionClient, issue: IssueEntity) {
    await this.normalizePositions(tx, this.issuesRepository.scopeForIssue(issue));
  }

  private async normalizePositions(
    tx: Prisma.TransactionClient,
    scope: IssueListScope,
  ): Promise<void> {
    const issuesList = await this.issuesRepository.listInScope(tx, scope);

    for (const [index, issue] of issuesList.entries()) {
      if (rankPositionToNumber(issue.rank_position) === index) {
        continue;
      }

      await this.issuesRepository.updateTx(tx, issue.id, {
        rank_position: rankPositionFromIndex(index),
        updated_at: new Date(),
      });
    }
  }

  private isSameScope(left: IssueListScope, right: IssueListScope) {
    return (
      left.projectId === right.projectId &&
      left.sprintId === right.sprintId &&
      left.statusId === right.statusId
    );
  }
}
