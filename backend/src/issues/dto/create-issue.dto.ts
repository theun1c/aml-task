import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ISSUE_TYPE_VALUES } from '../issue-type';
import type { IssueTypeValue } from '../issue-type';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateIssueDto {
  @ApiProperty({ example: 'Fix sprint board bug', minLength: 1, maxLength: 200 })
  @Transform(trimString)
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({
    example: 'Board drops issue into wrong column',
    maxLength: 5000,
    nullable: true,
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  description?: string | null;

  @ApiProperty({ enum: ISSUE_TYPE_VALUES, example: 'task' })
  @IsEnum(ISSUE_TYPE_VALUES)
  type: IssueTypeValue;

  @ApiPropertyOptional({
    example: '47f5f4dc-8e52-44a1-9f08-a4ff5d9fdd53',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}
