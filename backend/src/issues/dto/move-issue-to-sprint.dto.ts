import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsUUID } from 'class-validator';

export class MoveIssueToSprintDto {
  @ApiProperty({
    example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53',
    nullable: true,
  })
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  sprintId: string | null;
}
