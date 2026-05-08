import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateSprintDto {
  @ApiProperty({
    example: 'Sprint 1',
    description: 'Sprint name',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name: string;

  @ApiPropertyOptional({
    example: 'Prepare MVP for diploma demo',
    description: 'Sprint goal',
    nullable: true,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  goal?: string | null;

  @ApiPropertyOptional({
    example: '2026-05-08',
    description: 'Sprint start date',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string | null;

  @ApiPropertyOptional({
    example: '2026-05-22',
    description: 'Sprint end date',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string | null;
}
