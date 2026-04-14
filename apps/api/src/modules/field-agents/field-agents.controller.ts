import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FieldAgentsService } from './field-agents.service';
import { SubmitVisitDto, UpdateAssignmentStatusDto } from './dto/field-agent.dto';

@ApiTags('Field Agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('field-agents')
export class FieldAgentsController {
  constructor(private readonly fieldAgentsService: FieldAgentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'List all field agents (ops/admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.fieldAgentsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'Get single field agent with stats (ops/admin only)' })
  async findOne(@Param('id') id: string) {
    return this.fieldAgentsService.findOne(id);
  }

  @Get('dashboard/stats')
  @UseGuards(RolesGuard)
  @Roles('field_agent')
  @ApiOperation({ summary: 'Get field agent dashboard stats' })
  async getDashboardStats(@Req() req: any) {
    return this.fieldAgentsService.getDashboardStats(req.user.sub);
  }

  @Get('assignments')
  @UseGuards(RolesGuard)
  @Roles('field_agent')
  @ApiOperation({ summary: 'Get my assignments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  async getMyAssignments(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.fieldAgentsService.getMyAssignments(req.user.sub, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Patch('assignments/:id/status')
  @UseGuards(RolesGuard)
  @Roles('field_agent')
  @ApiOperation({ summary: 'Update assignment status' })
  async updateAssignmentStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.fieldAgentsService.updateAssignmentStatus(id, req.user.sub, dto);
  }

  @Post('visit')
  @UseGuards(RolesGuard)
  @Roles('field_agent')
  @ApiOperation({ summary: 'Submit a field visit report' })
  async submitVisitReport(@Req() req: any, @Body() dto: SubmitVisitDto) {
    return this.fieldAgentsService.submitVisitReport(req.user.sub, dto);
  }
}
