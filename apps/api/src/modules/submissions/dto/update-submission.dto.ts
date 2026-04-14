import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubmissionStatusDto {
  @ApiProperty({
    enum: ['pending', 'in_progress', 'field_visit', 'report_building', 'completed', 'rejected'],
  })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignFieldAgentDto {
  @ApiProperty()
  @IsString()
  fieldAgentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledDate?: string;
}
