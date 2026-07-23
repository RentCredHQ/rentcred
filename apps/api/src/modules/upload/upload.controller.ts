import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService, isPrivateKey } from './upload.service';

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
  constructor(
    private uploadService: UploadService,
    private prisma: PrismaService,
  ) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get a presigned URL for direct file upload to R2' })
  getPresignedUrl(@Body() dto: PresignedUrlDto, @Req() req: any) {
    return this.uploadService.getPresignedUploadUrl(
      dto.folder,
      dto.filename,
      dto.contentType,
      req.user.role,
    );
  }

  /**
   * Issues a short-lived download URL for a private document. Private objects
   * (KYB and tenant documents) are no longer reachable from the public bucket
   * URL, so this is the only way to read them — and it checks that the caller
   * actually owns the document first.
   */
  @Get('download-url')
  @ApiOperation({ summary: 'Get a short-lived download URL for a private document' })
  async getDownloadUrl(@Query('key') rawKey: string, @Req() req: any) {
    if (!rawKey) throw new BadRequestException('key is required');

    const key = this.uploadService.toObjectKey(rawKey);
    if (!isPrivateKey(key)) {
      throw new BadRequestException('This object is not a private document');
    }

    await this.assertOwnsDocument(key, req.user);

    return { url: await this.uploadService.getPresignedDownloadUrl(key) };
  }

  private async assertOwnsDocument(key: string, user: { sub: string; role: string }) {
    if (user.role === 'ops' || user.role === 'admin') return;

    const matches = (values: (string | null | undefined)[]) =>
      values.some((v) => v && this.uploadService.toObjectKey(v) === key);

    if (user.role === 'agent') {
      const profile = await this.prisma.agentProfile.findUnique({
        where: { userId: user.sub },
        include: { kybApplication: true },
      });
      const app = profile?.kybApplication;
      if (app && matches([app.cacDocument, app.directorIdUrl, app.utilityBillUrl])) return;
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'tenant') {
      const profile = await this.prisma.tenantProfile.findUnique({
        where: { userId: user.sub },
      });
      if (
        profile &&
        matches([profile.idDocumentUrl, profile.proofOfIncomeUrl, profile.utilityBillUrl])
      ) {
        return;
      }
      throw new ForbiddenException('Access denied');
    }

    throw new ForbiddenException('Access denied');
  }
}
