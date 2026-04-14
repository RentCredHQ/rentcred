import { Controller, Get, Patch, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantsService } from './tenants.service';
import {
  UpdatePersonalInfoDto,
  UpdateEmploymentDto,
  UpdateReferencesDto,
  UpdateDocumentsDto,
} from './dto/tenant-profile.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get own tenant profile' })
  async getOwnProfile(@Req() req: any) {
    return this.tenantsService.getProfile(req.user.sub, req.user.sub, req.user.role);
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get tenant profile by user ID (ops/admin)' })
  async getProfile(@Param('userId') userId: string, @Req() req: any) {
    return this.tenantsService.getProfile(userId, req.user.sub, req.user.role);
  }

  @Get('profile/status')
  @ApiOperation({ summary: 'Get profile completion status' })
  async getProfileStatus(@Req() req: any) {
    return this.tenantsService.getProfileStatus(req.user.sub);
  }

  @Patch('profile/personal')
  @ApiOperation({ summary: 'Step 1 — Update personal information' })
  async updatePersonalInfo(@Req() req: any, @Body() dto: UpdatePersonalInfoDto) {
    return this.tenantsService.updatePersonalInfo(req.user.sub, dto);
  }

  @Patch('profile/employment')
  @ApiOperation({ summary: 'Step 2 — Update employment information' })
  async updateEmployment(@Req() req: any, @Body() dto: UpdateEmploymentDto) {
    return this.tenantsService.updateEmployment(req.user.sub, dto);
  }

  @Patch('profile/references')
  @ApiOperation({ summary: 'Step 3 — Update references' })
  async updateReferences(@Req() req: any, @Body() dto: UpdateReferencesDto) {
    return this.tenantsService.updateReferences(req.user.sub, dto);
  }

  @Patch('profile/documents')
  @ApiOperation({ summary: 'Step 4 — Update document URLs' })
  async updateDocuments(@Req() req: any, @Body() dto: UpdateDocumentsDto) {
    return this.tenantsService.updateDocuments(req.user.sub, dto);
  }

  @Post('profile/consent')
  @ApiOperation({ summary: 'Record NDPR consent' })
  async recordConsent(@Req() req: any) {
    return this.tenantsService.recordConsent(req.user.sub);
  }

  @Get('my-submissions')
  @ApiOperation({ summary: 'Get submissions where this tenant is the subject' })
  async getMySubmissions(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tenantsService.findSubmissionsByTenantEmail(req.user.sub, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'Get completed reports about this tenant' })
  async getMyReports(@Req() req: any) {
    return this.tenantsService.findReportsByTenantEmail(req.user.sub);
  }
}
