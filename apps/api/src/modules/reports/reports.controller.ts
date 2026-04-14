import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { ReviewReportDto } from './dto/report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // --- Public endpoint (no auth) ---
  @Get('shared/:token')
  @ApiOperation({ summary: 'Get a shared report by public token (no auth required)' })
  async findByShareToken(@Param('token') token: string) {
    return this.reportsService.findByShareToken(token);
  }

  // --- Protected endpoints ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate/:submissionId')
  @ApiOperation({ summary: 'Generate a report from a submission' })
  async generate(@Param('submissionId') submissionId: string, @Req() req: any) {
    return this.reportsService.generate(submissionId, req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List reports (agents see own, ops/admin see all)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.findAll({
      userId: req.user.sub,
      role: req.user.role,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single report' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.reportsService.findOne(id, req.user.sub, req.user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'admin')
  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject a report (ops/admin only)' })
  async review(@Param('id') id: string, @Req() req: any, @Body() dto: ReviewReportDto) {
    return this.reportsService.review(id, req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  @ApiOperation({ summary: 'Generate a public share link for an approved report' })
  async share(@Param('id') id: string, @Req() req: any) {
    return this.reportsService.share(id, req.user.sub);
  }
}
