import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

class PresignedUrlDto {
  @IsString()
  folder: string;

  @IsString()
  filename: string;

  @IsString()
  contentType: string;
}

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get a presigned URL for direct file upload to S3/R2' })
  getPresignedUrl(@Body() dto: PresignedUrlDto) {
    return this.uploadService.getPresignedUploadUrl(
      dto.folder,
      dto.filename,
      dto.contentType,
    );
  }
}
