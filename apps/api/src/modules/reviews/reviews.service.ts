import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(tenantId: string, dto: CreateReviewDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      include: { review: true },
    });

    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.status !== 'completed') {
      throw new BadRequestException('Reviews can only be submitted for completed verifications');
    }
    if (submission.review) {
      throw new BadRequestException('A review already exists for this submission');
    }

    // Verify tenant's email matches submission
    const user = await this.prisma.user.findUnique({ where: { id: tenantId } });
    if (!user || user.email !== submission.tenantEmail) {
      throw new ForbiddenException('You can only review verifications about you');
    }

    const review = await this.prisma.review.create({
      data: {
        submissionId: dto.submissionId,
        tenantId,
        agentRating: dto.agentRating,
        agentComment: dto.agentComment,
        landlordRating: dto.landlordRating,
        landlordComment: dto.landlordComment,
        propertyRating: dto.propertyRating,
        propertyComment: dto.propertyComment,
        isAnonymous: dto.isAnonymous ?? false,
      },
    });

    await this.audit.log({
      userId: tenantId,
      action: 'review_created',
      entityType: 'review',
      entityId: review.id,
      metadata: { submissionId: dto.submissionId },
    });

    return review;
  }

  async findBySubmission(submissionId: string) {
    const review = await this.prisma.review.findUnique({
      where: { submissionId },
      include: {
        tenant: { select: { name: true } },
        submission: {
          select: { propertyAddress: true, landlordName: true, agentId: true },
        },
      },
    });

    if (!review) throw new NotFoundException('No review found for this submission');
    return review;
  }

  async findByAgent(agentId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where = {
      submission: { agentId },
      status: 'published',
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          tenant: { select: { name: true } },
          submission: {
            select: {
              propertyAddress: true,
              propertyType: true,
              neighborhood: true,
              state: true,
              landlordName: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    // Calculate aggregate
    const allRatings = await this.prisma.review.findMany({
      where,
      select: { agentRating: true },
    });
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.agentRating, 0) / allRatings.length
      : 0;

    // Anonymize if needed
    const sanitized = reviews.map((r) => ({
      ...r,
      tenant: r.isAnonymous ? { name: 'Anonymous' } : r.tenant,
    }));

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
      data: sanitized,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyReviews(tenantId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        submission: {
          select: {
            propertyAddress: true,
            propertyType: true,
            neighborhood: true,
            state: true,
            landlordName: true,
            agent: { select: { name: true } },
          },
        },
      },
    });

    return { data: reviews };
  }

  async updateStatus(id: string, userId: string, dto: UpdateReviewStatusDto) {
    if (!['flagged', 'removed'].includes(dto.status)) {
      throw new BadRequestException('Status must be flagged or removed');
    }

    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.audit.log({
      userId,
      action: `review_${dto.status}`,
      entityType: 'review',
      entityId: id,
    });

    return updated;
  }
}
