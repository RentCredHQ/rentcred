import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  submissionId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  agentRating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentComment?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  landlordRating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landlordComment?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  propertyRating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyComment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateReviewStatusDto {
  @ApiProperty()
  @IsString()
  status: string; // 'flagged' | 'removed'
}
