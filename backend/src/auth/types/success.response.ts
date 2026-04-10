import { IsBoolean } from 'class-validator';

export class SuccessResponse {
  @IsBoolean()
  success: boolean;
}
