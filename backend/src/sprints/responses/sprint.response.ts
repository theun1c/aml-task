import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SprintResponse {
  @ApiProperty({
    example: '2f18ab80-c8c8-4ce5-aac7-0bd40e10e0a5',
  })
  id: string;

  @ApiProperty({
    example: '99a0c63a-6d0e-4120-8b1f-8f2d4f8f2536',
  })
  project_id: string;

  @ApiProperty({
    example: 'Sprint 1',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Prepare MVP for diploma demo',
    nullable: true,
  })
  goal: string | null;

  @ApiProperty({
    example: 'planned',
    enum: ['planned', 'active', 'completed'],
  })
  status: string;

  @ApiPropertyOptional({
    example: '2026-05-08',
    nullable: true,
  })
  start_date: Date | null;

  @ApiPropertyOptional({
    example: '2026-05-22',
    nullable: true,
  })
  end_date: Date | null;

  @ApiPropertyOptional({
    example: '2026-05-22T10:00:00.000Z',
    nullable: true,
  })
  completed_at: Date | null;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  updated_at: Date;
}
