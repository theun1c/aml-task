import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.response';

export class AuthResponse {
  @ApiProperty({ example: '<jwt-access-token>' })
  accessToken: string;

  @ApiProperty({ example: '<jwt-refresh-token>' })
  refreshToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}
