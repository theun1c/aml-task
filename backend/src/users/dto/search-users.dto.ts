import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchUsersDto {
  @ApiProperty({
    example: 'exa',
    description: 'Email fragment to search active users by',
    minLength: 2,
    maxLength: 255,
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  email: string;
}
