import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/dispute.dto';

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('agent', 'tenant')
  @ApiOperation({ summary: 'Raise a dispute on a submission' })
  async create(@Req() req: any, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List disputes (ops/admin see all, others see own)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.disputesService.findAll({
      userId: req.user.sub,
      role: req.user.role,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single dispute' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  @ApiOperation({ summary: 'Resolve or update a dispute (ops/admin only)' })
  async resolve(@Param('id') id: string, @Req() req: any, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolve(id, req.user.sub, dto);
  }
}
