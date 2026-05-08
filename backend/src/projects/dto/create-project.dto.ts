import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'AML Task Manager',
    description: 'Project name',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  name: string;

  @ApiProperty({
    example: 'AML',
    description: 'Short unique project key used for issue numbering',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message:
      'project_key must start with an uppercase letter and contain only uppercase letters, numbers and underscores',
  })
  project_key: string;

  @ApiPropertyOptional({
    example: 'Backend task manager for diploma project',
    description: 'Project description',
    nullable: true,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;
}
