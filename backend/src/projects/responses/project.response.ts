import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponse {
  @ApiProperty({
    example: '99a0c63a-6d0e-4120-8b1f-8f2d4f8f2536',
  })
  id: string;

  @ApiProperty({
    example: 'AML Task Manager',
  })
  name: string;

  @ApiProperty({
    example: 'AML',
  })
  project_key: string;

  @ApiPropertyOptional({
    example: 'Backend task manager for diploma project',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53',
  })
  owner_id: string;

  @ApiProperty({
    example: false,
  })
  is_archived: boolean;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  updated_at: Date;
}