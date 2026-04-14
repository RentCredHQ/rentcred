import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitVisitDto {
  @ApiProperty()
  @IsString()
  submissionId: string;

  @ApiProperty()
  @IsDateString()
  visitDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gpsLatitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gpsLongitude?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  checklistItems?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;
}

export class UpdateAssignmentStatusDto {
  @ApiProperty({ enum: ['assigned', 'in_progress', 'completed'] })
  @IsString()
  status: string;
}
