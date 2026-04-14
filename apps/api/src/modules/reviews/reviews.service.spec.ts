import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    submission: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const tenantId = 'tenant-1';
    const createReviewDto = {
      submissionId: 'sub-1',
      agentRating: 5,
      agentComment: 'Great agent',
      landlordRating: 4,
      landlordComment: 'Good landlord',
      propertyRating: 3,
      propertyComment: 'Average property',
      isAnonymous: false,
    };

    const mockSubmission = {
      id: 'sub-1',
      status: 'completed',
      tenantEmail: 'tenant@example.com',
      review: null,
    };

    const mockUser = {
      id: tenantId,
      email: 'tenant@example.com',
    };

    const mockCreatedReview = {
      id: 'review-1',
      submissionId: 'sub-1',
      tenantId,
      agentRating: 5,
      agentComment: 'Great agent',
      landlordRating: 4,
      landlordComment: 'Good landlord',
      propertyRating: 3,
      propertyComment: 'Average property',
      isAnonymous: false,
      createdAt: new Date(),
    };

    it('should successfully create a review with all ratings', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.review.create.mockResolvedValue(mockCreatedReview);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.create(tenantId, createReviewDto);

      expect(result).toEqual(mockCreatedReview);
      expect(mockPrismaService.review.create).toHaveBeenCalledWith({
        data: {
          submissionId: createReviewDto.submissionId,
          tenantId,
          agentRating: createReviewDto.agentRating,
          agentComment: createReviewDto.agentComment,
          landlordRating: createReviewDto.landlordRating,
          landlordComment: createReviewDto.landlordComment,
          propertyRating: createReviewDto.propertyRating,
          propertyComment: createReviewDto.propertyComment,
          isAnonymous: false,
        },
      });
    });

    it('should throw BadRequestException when submission is not completed', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        status: 'pending',
      });

      await expect(service.create(tenantId, createReviewDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.review.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when review already exists', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        review: { id: 'existing-review' },
      });

      await expect(service.create(tenantId, createReviewDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.review.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when tenant email does not match', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: tenantId,
        email: 'different@example.com',
      });

      await expect(service.create(tenantId, createReviewDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.review.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(service.create(tenantId, createReviewDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.review.create).not.toHaveBeenCalled();
    });

    it('should log an audit event after creating the review', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.review.create.mockResolvedValue(mockCreatedReview);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(tenantId, createReviewDto);

      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId: tenantId,
        action: 'review_created',
        entityType: 'review',
        entityId: mockCreatedReview.id,
        metadata: { submissionId: createReviewDto.submissionId },
      });
    });
  });

  describe('findBySubmission', () => {
    const submissionId = 'sub-1';

    it('should return a review with tenant and submission data', async () => {
      const mockReview = {
        id: 'review-1',
        submissionId,
        tenantId: 'tenant-1',
        agentRating: 5,
        tenant: { name: 'Jane Doe' },
        submission: {
          propertyAddress: '123 Main St',
          landlordName: 'John Smith',
          agentId: 'agent-1',
        },
      };

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      const result = await service.findBySubmission(submissionId);

      expect(result).toEqual(mockReview);
      expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
        where: { submissionId },
        include: {
          tenant: { select: { name: true } },
          submission: {
            select: { propertyAddress: true, landlordName: true, agentId: true },
          },
        },
      });
    });

    it('should throw NotFoundException when no review found', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.findBySubmission(submissionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByAgent', () => {
    const agentId = 'agent-1';
    const options = { page: 1, limit: 10 };

    it('should return paginated reviews with average rating calculation', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          agentRating: 5,
          isAnonymous: false,
          tenant: { name: 'Jane Doe' },
          submission: {
            propertyAddress: '123 Main St',
            propertyType: 'apartment',
            neighborhood: 'Downtown',
            state: 'Lagos',
            landlordName: 'John Smith',
          },
        },
        {
          id: 'review-2',
          agentRating: 3,
          isAnonymous: false,
          tenant: { name: 'Bob Jones' },
          submission: {
            propertyAddress: '456 Oak Ave',
            propertyType: 'house',
            neighborhood: 'Suburb',
            state: 'Abuja',
            landlordName: 'Alice Brown',
          },
        },
      ];

      mockPrismaService.review.findMany
        .mockResolvedValueOnce(mockReviews) // paginated results
        .mockResolvedValueOnce([{ agentRating: 5 }, { agentRating: 3 }]); // all ratings
      mockPrismaService.review.count.mockResolvedValue(2);

      const result = await service.findByAgent(agentId, options);

      expect(result.averageRating).toBe(4);
      expect(result.totalReviews).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should anonymize tenant name when isAnonymous is true', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          agentRating: 4,
          isAnonymous: true,
          tenant: { name: 'Jane Doe' },
          submission: {
            propertyAddress: '123 Main St',
            propertyType: 'apartment',
            neighborhood: 'Downtown',
            state: 'Lagos',
            landlordName: 'John Smith',
          },
        },
      ];

      mockPrismaService.review.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([{ agentRating: 4 }]);
      mockPrismaService.review.count.mockResolvedValue(1);

      const result = await service.findByAgent(agentId, options);

      expect(result.data[0].tenant).toEqual({ name: 'Anonymous' });
    });

    it('should return 0 average when there are no reviews', async () => {
      mockPrismaService.review.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrismaService.review.count.mockResolvedValue(0);

      const result = await service.findByAgent(agentId, options);

      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findMyReviews', () => {
    it('should return the tenant\'s own reviews', async () => {
      const tenantId = 'tenant-1';
      const mockReviews = [
        {
          id: 'review-1',
          tenantId,
          agentRating: 5,
          submission: {
            propertyAddress: '123 Main St',
            propertyType: 'apartment',
            neighborhood: 'Downtown',
            state: 'Lagos',
            landlordName: 'John Smith',
            agent: { name: 'Agent One' },
          },
        },
      ];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findMyReviews(tenantId);

      expect(result).toEqual({ data: mockReviews });
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('updateStatus', () => {
    const reviewId = 'review-1';
    const userId = 'ops-1';

    it('should flag a review successfully', async () => {
      const mockReview = { id: reviewId, status: 'published' };
      const mockUpdated = { ...mockReview, status: 'flagged' };

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.update.mockResolvedValue(mockUpdated);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.updateStatus(reviewId, userId, {
        status: 'flagged',
      });

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
        data: { status: 'flagged' },
      });
      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId,
        action: 'review_flagged',
        entityType: 'review',
        entityId: reviewId,
      });
    });

    it('should remove a review successfully', async () => {
      const mockReview = { id: reviewId, status: 'published' };
      const mockUpdated = { ...mockReview, status: 'removed' };

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.update.mockResolvedValue(mockUpdated);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.updateStatus(reviewId, userId, {
        status: 'removed',
      });

      expect(result).toEqual(mockUpdated);
      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId,
        action: 'review_removed',
        entityType: 'review',
        entityId: reviewId,
      });
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        service.updateStatus(reviewId, userId, { status: 'invalid' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.review.findUnique).not.toHaveBeenCalled();
    });
  });
});
