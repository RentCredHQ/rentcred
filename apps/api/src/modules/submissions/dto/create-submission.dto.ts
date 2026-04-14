import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty()
  @IsString()
  tenantName: string;

  @ApiProperty()
  @IsEmail()
  tenantEmail: string;

  @ApiProperty()
  @IsString()
  tenantPhone: string;

  @ApiProperty()
  @IsString()
  propertyAddress: string;

  @ApiProperty()
  @IsNumber()
  annualRent: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyRent?: number;

  @ApiProperty()
  @IsString()
  propertyType: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(6)
  bedrooms: number;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  lga: string;

  @ApiProperty()
  @IsString()
  neighborhood: string;

  @ApiProperty()
  @IsString()
  landlordName: string;

  @ApiProperty()
  @IsString()
  landlordPhone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyCondition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyImages?: string[];

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
  @IsNumber()
  monthlyIncome?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonForMoving?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsBoolean()
  consentObtained: boolean;
}
