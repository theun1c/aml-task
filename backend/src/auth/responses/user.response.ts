import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Alex' })
  @IsString()
  full_name: string;
}
