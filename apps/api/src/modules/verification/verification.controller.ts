import { Controller, Get, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VerificationService } from './verification.service';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@ApiTags('Verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('checklist/:submissionId')
  @UseGuards(RolesGuard)
  @Roles('agent', 'ops', 'admin')
  @ApiOperation({ summary: 'Get verification checklist for a submission' })
  async getChecklist(@Param('submissionId') submissionId: string) {
    return this.verificationService.getChecklist(submissionId);
  }

  @Patch('checklist/:submissionId')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin', 'field_agent')
  @ApiOperation({ summary: 'Update verification checklist items' })
  async updateChecklist(
    @Param('submissionId') submissionId: string,
    @Req() req: any,
    @Body() dto: UpdateChecklistDto,
  ) {
    return this.verificationService.updateChecklist(submissionId, req.user.sub, dto);
  }
}
