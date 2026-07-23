import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsEmail,
  IsBoolean,
  MinLength,
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

export class CreateFieldAgentDto {
  @ApiProperty({ example: 'Ola Adeyemi' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'ola.adeyemi@rentcred.ng' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+234 801 111 1111' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateFieldAgentStatusDto {
  @ApiProperty({ description: 'false suspends the account, true reactivates it' })
  @IsBoolean()
  isActive: boolean;
}
