import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.response';

export class AuthResponse {
  @ApiProperty({ example: '<jwt-access-token>' })
  access_token: string;

  @ApiProperty({ example: '<jwt-refresh-token>' })
  refresh_token: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}
