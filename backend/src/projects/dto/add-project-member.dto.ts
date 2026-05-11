import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'User email to add as project member',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  email: string;
}
