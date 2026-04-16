import { IsEmail, IsEnum, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({ enum: ['agent', 'tenant'] })
  @IsEnum(['agent', 'tenant'])
  role: 'agent' | 'tenant';
}
