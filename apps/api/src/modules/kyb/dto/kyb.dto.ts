import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyKybDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsString()
  rcNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cacDocumentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  directorIdUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utilityBillUrl?: string;
}

export class ReviewKybDto {
  @ApiProperty({ enum: ['under_review', 'approved', 'rejected'] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
