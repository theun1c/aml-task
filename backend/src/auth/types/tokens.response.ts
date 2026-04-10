import { IsString } from 'class-validator';

export class TokensResponse {
  @IsString()
  authToken: string;

  @IsString()
  refreshToken: string;
}
