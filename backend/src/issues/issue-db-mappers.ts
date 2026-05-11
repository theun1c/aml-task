import { ConflictException } from '@nestjs/common';

type IssueApiType = 'task' | 'bug';

type DecimalLike = {
  toNumber?: () => number;
  toString: () => string;
};

type IssueTypeRecord = {
  code: string;
};

type IssueRecordForResponse = {
  id: string;
  issue_number: bigint;
  project_id: string;
  sprint_id: string | null;
  status_id: string;
  reporter_id: string;
  assignee_id: string | null;
  title: string;
  description: string | null;
  type_id: number;
  rank_position: DecimalLike | number | string | null;
  created_at: Date;
  updated_at: Date;
  issue_types: IssueTypeRecord;
};

export function mapDbIssueTypeCodeToApiType(code: string): IssueApiType {
  if (code === 'task' || code === 'bug') {
    return code;
  }

  throw new ConflictException(`Issue type "${code}" is not supported by API`);
}

export function rankPositionFromIndex(index: number): number {
  return index;
}

export function rankPositionToNumber(rankPosition: DecimalLike | number | string | null): number {
  if (rankPosition === null) {
    return 0;
  }

  if (typeof rankPosition === 'number') {
    return rankPosition;
  }

  if (typeof rankPosition === 'string') {
    return Number(rankPosition);
  }

  if (typeof rankPosition.toNumber === 'function') {
    return rankPosition.toNumber();
  }

  return Number(rankPosition.toString());
}

export function mapIssueToResponse(issue: IssueRecordForResponse) {
  return {
    id: issue.id,
    issue_number: issue.issue_number.toString(),
    project_id: issue.project_id,
    sprint_id: issue.sprint_id,
    status_id: issue.status_id,
    reporter_id: issue.reporter_id,
    assignee_id: issue.assignee_id,
    title: issue.title,
    description: issue.description,
    type_id: issue.type_id,
    type_code: mapDbIssueTypeCodeToApiType(issue.issue_types.code),
    rank_position: rankPositionToNumber(issue.rank_position),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
}
