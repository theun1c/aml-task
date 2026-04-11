import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse {
  @ApiProperty({ example: true })
  success: boolean;
}
