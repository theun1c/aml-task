import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'AML Task Manager Updated',
    description: 'Project name',
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated backend task manager description',
    description: 'Project description',
    nullable: true,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Project archive flag',
  })
  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;
}
