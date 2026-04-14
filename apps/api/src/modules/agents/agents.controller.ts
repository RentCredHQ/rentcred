import { Controller, Get, Patch, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AgentsService } from './agents.service';
import { UpdateAgentProfileDto } from './dto/update-agent-profile.dto';

@ApiTags('Agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('agent')
@Controller('agent')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get agent dashboard statistics' })
  async getDashboardStats(@Req() req: any) {
    return this.agentsService.getDashboardStats(req.user.sub);
  }

  @Get('dashboard/recent')
  @ApiOperation({ summary: 'Get recent submissions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentSubmissions(@Req() req: any, @Query('limit') limit?: string) {
    return this.agentsService.getRecentSubmissions(
      req.user.sub,
      limit ? parseInt(limit, 10) : 5,
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTransactions(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.agentsService.getTransactionHistory(
      req.user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update agent profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateAgentProfileDto) {
    return this.agentsService.updateProfile(req.user.sub, dto);
  }
}
