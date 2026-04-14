import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionStatusDto, AssignFieldAgentDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('agent')
  @ApiOperation({ summary: 'Create a new tenant verification submission' })
  create(@Request() req: any, @Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List submissions (agents see own, ops/admin see all)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.submissionsService.findAll({
      userId: req.user.sub,
      role: req.user.role,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single submission with full details' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.submissionsService.findById(id, req.user.sub, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'Update submission status (ops/admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateSubmissionStatusDto,
  ) {
    return this.submissionsService.updateStatus(id, req.user.sub, dto);
  }

  @Post(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'Assign a field agent to a submission (ops/admin only)' })
  assignFieldAgent(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AssignFieldAgentDto,
  ) {
    return this.submissionsService.assignFieldAgent(id, req.user.sub, dto);
  }

  @Post(':id/reassign')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'Reassign case to a different field agent (ops/admin only)' })
  reassign(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AssignFieldAgentDto,
  ) {
    return this.submissionsService.assignFieldAgent(id, req.user.sub, dto);
  }
}
