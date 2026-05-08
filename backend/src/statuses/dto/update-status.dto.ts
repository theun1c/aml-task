import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateStatusDto {
  @ApiPropertyOptional({
    example: 'Code Review',
    description: 'Status name',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    example: 'in_progress',
    enum: ['todo', 'in_progress', 'done'],
    description: 'Status category',
  })
  @IsOptional()
  @IsString()
  @IsIn(['todo', 'in_progress', 'done'])
  category?: string;

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
    example: 2,
    description: 'Status position in board',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this status is final',
  })
  @IsOptional()
  @IsBoolean()
  is_final?: boolean;
}