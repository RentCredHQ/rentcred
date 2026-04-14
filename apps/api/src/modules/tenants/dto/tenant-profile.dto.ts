import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Step 1 — Personal Info
export class UpdatePersonalInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stateOfOrigin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ninNumber?: string;
}

// Step 2 — Employment
export class UpdateEmploymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employerAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @ApiPropertyOptional({ enum: ['full_time', 'part_time', 'self_employed', 'unemployed'] })
  @IsOptional()
  @IsString()
  employmentType?: string;
}

// Step 3 — References
export class UpdateReferencesDto {
  @ApiProperty()
  @IsString()
  ref1Name: string;

  @ApiProperty()
  @IsString()
  ref1Phone: string;

  @ApiProperty()
  @IsString()
  ref1Relationship: string;

  @ApiProperty()
  @IsString()
  ref2Name: string;

  @ApiProperty()
  @IsString()
  ref2Phone: string;

  @ApiProperty()
  @IsString()
  ref2Relationship: string;
}

// Step 4 — Documents
export class UpdateDocumentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idDocumentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proofOfIncomeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utilityBillUrl?: string;
}
