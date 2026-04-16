import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { KybService } from './kyb.service';
import { ApplyKybDto, ReviewKybDto } from './dto/kyb.dto';

@ApiTags('KYB')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kyb')
export class KybController {
  constructor(private readonly kybService: KybService) {}

  @Post('apply')
  @UseGuards(RolesGuard)
  @Roles('agent')
  @ApiOperation({ summary: 'Submit KYB application (agent only)' })
  async apply(@Req() req: any, @Body() dto: ApplyKybDto) {
    return this.kybService.applyForKyb(req.user.sub, dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List KYB applications (agents see own, ops/admin see all)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  async getApplications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.kybService.getApplications(req.user.sub, req.user.role, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get('applications/:id')
  @UseGuards(RolesGuard)
  @Roles('agent', 'ops', 'admin')
  @ApiOperation({ summary: 'Get a single KYB application' })
  async getApplication(@Param('id') id: string) {
    return this.kybService.getApplication(id);
  }

  @Patch('applications/:id/review')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'Review KYB application (ops/admin only)' })
  async reviewApplication(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: ReviewKybDto,
  ) {
    return this.kybService.reviewApplication(id, req.user.sub, dto);
  }
}
