import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponse {
  @ApiProperty({ example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Alex' })
  full_name: string;
}
