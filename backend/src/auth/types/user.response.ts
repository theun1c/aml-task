import { IsString, IsUUID } from 'class-validator';
import type { UUID } from 'crypto';

export class UserResponse {
  @IsUUID()
  id: UUID;

  @IsString()
  email: string;

  @IsString()
  name: string;
}
