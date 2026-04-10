import { IsString } from 'class-validator';

export class TokensResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
