import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectMemberResponse {
  @ApiProperty({
    example: 'd53ce6b2-c248-4d77-aa73-8a8ed0336586',
  })
  id: string;

  @ApiProperty({
    example: '99a0c63a-6d0e-4120-8b1f-8f2d4f8f2536',
  })
  project_id: string;

  @ApiProperty({
    example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53',
  })
  user_id: string;

  @ApiProperty({
    example: 'member',
    enum: ['owner', 'member'],
  })
  role: string;

  @ApiProperty({
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  joined_at: Date;

  @ApiPropertyOptional({
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'Alex',
  })
  full_name?: string;
}
