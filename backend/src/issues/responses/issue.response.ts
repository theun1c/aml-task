import { ApiProperty } from '@nestjs/swagger';
import { ISSUE_TYPE_VALUES } from '../issue-type';
import type { IssueTypeValue } from '../issue-type';

export class IssueResponse {
  @ApiProperty({ example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53' })
  id: string;

  @ApiProperty({ example: '99a0c63a-6d0e-4120-8b1f-8f2d4f8f2536' })
  projectId: string;

  @ApiProperty({ example: '2f18ab80-c8c8-4ce5-aac7-0bd40e10e0a5', nullable: true })
  sprintId: string | null;

  @ApiProperty({ example: '3f2c9ac1-e0aa-4e54-80d4-3d4585c7c94c' })
  statusId: string;

  @ApiProperty({ example: '4ebd6b8e-c7ea-4518-95e2-04447bfbd52d' })
  creatorId: string;

  @ApiProperty({ example: 'e97ab0d1-f69d-42b2-aa30-209ff6ab616e', nullable: true })
  assigneeId: string | null;

  @ApiProperty({ example: 'Fix sprint board bug' })
  title: string;

  @ApiProperty({ example: 'Board drops issue into wrong column', nullable: true })
  description: string | null;

  @ApiProperty({ enum: ISSUE_TYPE_VALUES, example: 'task' })
  type: IssueTypeValue;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: '2026-04-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-27T10:00:00.000Z' })
  updatedAt: Date;
}
