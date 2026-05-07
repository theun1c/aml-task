import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokensResponse {
  @ApiProperty({ example: '<jwt-access-token>' })
  @IsString()
  access_token: string;

  @ApiProperty({ example: '<jwt-refresh-token>' })
  @IsString()
  refresh_token: string;
}
