import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({
    example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53',
    description: 'User id to add as project member',
  })
  @IsUUID()
  user_id: string;
}
