import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokensResponse {
  @ApiProperty({ example: '<jwt-access-token>' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: '<jwt-refresh-token>' })
  @IsString()
  refreshToken: string;
}
