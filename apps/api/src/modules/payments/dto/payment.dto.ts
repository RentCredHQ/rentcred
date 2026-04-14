import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseBundleDto {
  @ApiProperty({ description: 'Credit bundle ID to purchase' })
  @IsString()
  bundleId: string;
}
