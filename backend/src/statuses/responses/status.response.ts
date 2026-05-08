import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatusResponse {
  @ApiProperty({
    example: '3f2c9ac1-e0aa-4e54-80d4-3d4585c7c94c',
  })
  id: string;

  @ApiProperty({
    example: '99a0c63a-6d0e-4120-8b1f-8f2d4f8f2536',
  })
  project_id: string;

  @ApiProperty({
    example: 'To Do',
  })
  name: string;

  @ApiProperty({
    example: 'todo',
    enum: ['todo', 'in_progress', 'done'],
  })
  category: string;

  @ApiProperty({
    example: 0,
  })
  position: number;

  @ApiPropertyOptional({
    example: '#6B7280',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    example: true,
  })
  is_default: boolean;

  @ApiProperty({
    example: false,
  })
  is_final: boolean;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  updated_at: Date;
}