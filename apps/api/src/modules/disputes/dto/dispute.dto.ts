import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  submissionId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: ['under_review', 'resolved', 'closed'] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;
}
