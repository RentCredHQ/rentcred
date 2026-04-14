import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OpsService } from './ops.service';

@ApiTags('Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ops', 'admin')
@Controller('ops')
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  async getDashboardStats() {
    return this.opsService.getDashboardStats();
  }

  @Get('dashboard/activity')
  @ApiOperation({ summary: 'Get recent platform activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.opsService.getRecentActivity(limit ? parseInt(limit, 10) : 10);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.opsService.getUsers({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      role,
      search,
    });
  }
}
