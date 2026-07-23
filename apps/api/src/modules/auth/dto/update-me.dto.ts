import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Role-agnostic profile fields. Field agents have no AgentProfile row, so
 * PATCH /agent/profile cannot serve them.
 */
export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Ola Adeyemi' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: '+234 801 111 1111' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'profile-photos/abc.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string;
}
