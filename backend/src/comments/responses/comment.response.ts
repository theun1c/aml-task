import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentResponse {
  @ApiProperty({
    example: '7b4a1f9a-7b2c-4cc7-9f89-7e6d93f1b123',
  })
  id: string;

  @ApiProperty({
    example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53',
  })
  issue_id: string;

  @ApiProperty({
    example: '4ebd6b8e-c7ea-4518-95e2-04447bfbd52d',
  })
  author_id: string;

  @ApiProperty({
    example: 'I reproduced this bug locally',
  })
  content: string;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    example: '2026-05-08T10:00:00.000Z',
  })
  updated_at: Date;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
  })
  deleted_at: Date | null;

  @ApiPropertyOptional({
    example: 'user@example.com',
  })
  author_email?: string;

  @ApiPropertyOptional({
    example: 'Alex',
  })
  author_full_name?: string;
}