import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChecklistDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  identityVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  employmentVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  referencesVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  addressVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  criminalCheckDone?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fieldVisitCompleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
