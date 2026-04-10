import { IsString, IsUUID } from 'class-validator';

export class UserResponse {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  name: string;
}
