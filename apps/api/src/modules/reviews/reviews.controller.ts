import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a review (tenant only, submission must be completed)' })
  async create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my reviews (tenant)' })
  async getMyReviews(@Req() req: any) {
    return this.reviewsService.findMyReviews(req.user.sub);
  }

  @Get('submission/:submissionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get review for a submission' })
  async getBySubmission(@Param('submissionId') submissionId: string) {
    return this.reviewsService.findBySubmission(submissionId);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get all reviews for an agent (public)' })
  async getByAgent(
    @Param('agentId') agentId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByAgent(agentId, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Flag or remove a review (ops/admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewsService.updateStatus(id, req.user.sub, dto);
  }
}
