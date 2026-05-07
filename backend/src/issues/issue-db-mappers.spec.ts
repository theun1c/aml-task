import {
  mapDbIssueTypeCodeToApiType,
  mapIssueToResponse,
  rankPositionFromIndex,
  rankPositionToNumber,
} from './issue-db-mappers';

const decimal = (value: number) => ({
  toNumber: () => value,
  toString: () => String(value),
});

describe('issue-db-mappers', () => {
  it('mapDbIssueTypeCodeToApiType() should keep supported MVP type codes', () => {
    expect(mapDbIssueTypeCodeToApiType('task')).toBe('task');
    expect(mapDbIssueTypeCodeToApiType('bug')).toBe('bug');
  });

  it('rankPositionFromIndex() should create a Prisma Decimal index value', () => {
    expect(rankPositionFromIndex(3).toString()).toBe('3');
  });

  it('rankPositionToNumber() should normalize Decimal values into API numbers', () => {
    expect(rankPositionToNumber(decimal(12))).toBe(12);
    expect(rankPositionToNumber(null)).toBe(0);
  });

  it('mapIssueToResponse() should map DB field names into the public issue response', () => {
    const response = mapIssueToResponse({
      id: 'issue-1',
      issue_number: BigInt(15),
      project_id: 'project-1',
      sprint_id: null,
      status_id: 'status-1',
      reporter_id: 'user-1',
      assignee_id: 'user-2',
      title: 'Fix board bug',
      description: 'Board sends issue to the wrong lane',
      type_id: 2,
      rank_position: decimal(4),
      created_at: new Date('2026-05-01T10:00:00.000Z'),
      updated_at: new Date('2026-05-01T11:00:00.000Z'),
      issue_types: {
        code: 'bug',
      },
    });

    expect(response).toEqual({
      id: 'issue-1',
      issue_number: '15',
      project_id: 'project-1',
      sprint_id: null,
      status_id: 'status-1',
      reporter_id: 'user-1',
      assignee_id: 'user-2',
      title: 'Fix board bug',
      description: 'Board sends issue to the wrong lane',
      type_id: 2,
      type_code: 'bug',
      rank_position: 4,
      created_at: new Date('2026-05-01T10:00:00.000Z'),
      updated_at: new Date('2026-05-01T11:00:00.000Z'),
    });
  });
});
