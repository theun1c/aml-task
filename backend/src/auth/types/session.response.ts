import { ApiProperty } from '@nestjs/swagger';

export class SessionResponse {
  @ApiProperty({ example: 'd53ce6b2-c248-4d77-aa73-8a8ed0336586' })
  id: string;

  @ApiProperty({ example: '2026-04-12T10:20:30.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-04-19T10:20:30.000Z' })
  expires_at: Date;

  @ApiProperty({ example: null, nullable: true })
  revoked_at: Date | null;
}
