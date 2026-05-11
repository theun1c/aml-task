import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateStatusDto {
  @ApiProperty({
    example: 'Review',
    description: 'Status name',
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    example: 'in_progress',
    enum: ['todo', 'in_progress', 'done'],
    description: 'Status category',
  })
  @IsString()
  @IsIn(['todo', 'in_progress', 'done'])
  category: string;

  @ApiPropertyOptional({
    example: '#A855F7',
    description: 'Status color',
    nullable: true,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this status is final',
  })
  @IsOptional()
  @IsBoolean()
  is_final?: boolean;
}
