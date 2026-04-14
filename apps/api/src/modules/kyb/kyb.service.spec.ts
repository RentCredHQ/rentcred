import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { KybService } from './kyb.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('KybService', () => {
  let service: KybService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    agentProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    kybApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockNotificationsService = {
    emit: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KybService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<KybService>(KybService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =============================================
  // applyForKyb
  // =============================================
  describe('applyForKyb', () => {
    const userId = 'user-1';
    const dto = {
      companyName: 'Acme Realty',
      rcNumber: 'RC123456',
      cacDocument: 'https://example.com/cac.pdf',
      directorIdUrl: 'https://example.com/id.jpg',
      utilityBillUrl: 'https://example.com/bill.pdf',
    };

    const mockProfile = {
      id: 'profile-1',
      userId,
      kybApplication: null,
    };

    it('should create application and set kybStatus to submitted', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockProfile);
      const mockApp = {
        id: 'kyb-1',
        agentProfileId: mockProfile.id,
        ...dto,
        status: 'pending',
      };
      mockPrismaService.kybApplication.create.mockResolvedValue(mockApp);
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      const result = await service.applyForKyb(userId, dto);

      expect(result).toEqual(mockApp);
      expect(mockPrismaService.kybApplication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agentProfileId: mockProfile.id,
          companyName: dto.companyName,
          rcNumber: dto.rcNumber,
          status: 'pending',
        }),
      });
      expect(mockPrismaService.agentProfile.update).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
        data: { kybStatus: 'submitted', companyName: dto.companyName, rcNumber: dto.rcNumber },
      });
    });

    it('should throw BadRequestException when application already exists', async () => {
      const profileWithApp = {
        ...mockProfile,
        kybApplication: { id: 'kyb-existing', status: 'pending' },
      };
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(profileWithApp);

      await expect(service.applyForKyb(userId, dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.kybApplication.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when agent profile not found', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(null);

      await expect(service.applyForKyb(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should log audit event on application submission', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.kybApplication.create.mockResolvedValue({
        id: 'kyb-1',
        agentProfileId: mockProfile.id,
        status: 'pending',
      });
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.applyForKyb(userId, dto);

      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId,
        action: 'kyb_application_submitted',
        entityType: 'kyb_application',
        entityId: 'kyb-1',
      });
    });
  });

  // =============================================
  // getApplications
  // =============================================
  describe('getApplications', () => {
    it('should return only own applications for agents', async () => {
      const userId = 'agent-user-1';
      const mockProfile = { id: 'profile-1', userId };

      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.kybApplication.findMany.mockResolvedValue([
        { id: 'kyb-1', agentProfileId: 'profile-1', status: 'pending' },
      ]);
      mockPrismaService.kybApplication.count.mockResolvedValue(1);

      const result = await service.getApplications(userId, 'agent');

      expect(mockPrismaService.kybApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agentProfileId: 'profile-1' },
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should return all applications for ops', async () => {
      const userId = 'ops-user-1';

      mockPrismaService.kybApplication.findMany.mockResolvedValue([
        { id: 'kyb-1', status: 'pending' },
        { id: 'kyb-2', status: 'approved' },
      ]);
      mockPrismaService.kybApplication.count.mockResolvedValue(2);

      const result = await service.getApplications(userId, 'ops');

      // Should NOT look up agent profile
      expect(mockPrismaService.agentProfile.findUnique).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
    });

    it('should handle pagination correctly', async () => {
      const userId = 'ops-user-1';

      mockPrismaService.kybApplication.findMany.mockResolvedValue([]);
      mockPrismaService.kybApplication.count.mockResolvedValue(25);

      const result = await service.getApplications(userId, 'ops', { page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(mockPrismaService.kybApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should filter by status when provided', async () => {
      const userId = 'ops-user-1';

      mockPrismaService.kybApplication.findMany.mockResolvedValue([]);
      mockPrismaService.kybApplication.count.mockResolvedValue(0);

      await service.getApplications(userId, 'ops', { status: 'pending' });

      expect(mockPrismaService.kybApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'pending' },
        }),
      );
    });
  });

  // =============================================
  // getApplication
  // =============================================
  describe('getApplication', () => {
    it('should return a single application', async () => {
      const mockApp = {
        id: 'kyb-1',
        status: 'pending',
        agentProfile: {
          user: { id: 'user-1', name: 'Agent', email: 'agent@test.com' },
        },
      };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);

      const result = await service.getApplication('kyb-1');

      expect(result).toEqual(mockApp);
    });

    it('should throw NotFoundException when application not found', async () => {
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(null);

      await expect(service.getApplication('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // =============================================
  // reviewApplication
  // =============================================
  describe('reviewApplication', () => {
    const appId = 'kyb-1';
    const reviewerId = 'ops-user-1';

    const mockApp = {
      id: appId,
      agentProfileId: 'profile-1',
      status: 'pending',
      agentProfile: {
        id: 'profile-1',
        userId: 'agent-user-1',
      },
    };

    it('should approve application and sync kybStatus', async () => {
      const dto = { status: 'approved', reviewNotes: 'All documents verified' };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.kybApplication.update.mockResolvedValue({
        ...mockApp,
        status: 'approved',
        reviewedBy: reviewerId,
      });
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      const result = await service.reviewApplication(appId, reviewerId, dto);

      expect(result.status).toBe('approved');
      expect(mockPrismaService.kybApplication.update).toHaveBeenCalledWith({
        where: { id: appId },
        data: {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewNotes: 'All documents verified',
        },
      });
      expect(mockPrismaService.agentProfile.update).toHaveBeenCalledWith({
        where: { id: 'profile-1' },
        data: { kybStatus: 'approved' },
      });
    });

    it('should reject application with review notes', async () => {
      const dto = { status: 'rejected', reviewNotes: 'Invalid CAC document' };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.kybApplication.update.mockResolvedValue({
        ...mockApp,
        status: 'rejected',
        reviewNotes: dto.reviewNotes,
      });
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      const result = await service.reviewApplication(appId, reviewerId, dto);

      expect(result.status).toBe('rejected');
      expect(mockPrismaService.kybApplication.update).toHaveBeenCalledWith({
        where: { id: appId },
        data: expect.objectContaining({
          status: 'rejected',
          reviewNotes: 'Invalid CAC document',
        }),
      });
    });

    it('should notify agent on review', async () => {
      const dto = { status: 'approved' };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.kybApplication.update.mockResolvedValue({ ...mockApp, status: 'approved' });
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.reviewApplication(appId, reviewerId, dto);

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-user-1',
          type: 'kyb_update',
          title: 'KYB Approved!',
        }),
      );
    });

    it('should send rejection notification with notes', async () => {
      const dto = { status: 'rejected', reviewNotes: 'Bad docs' };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.kybApplication.update.mockResolvedValue({ ...mockApp, status: 'rejected' });
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.reviewApplication(appId, reviewerId, dto);

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-user-1',
          type: 'kyb_update',
          message: expect.stringContaining('Bad docs'),
        }),
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      const dto = { status: 'invalid_status' };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.reviewApplication(appId, reviewerId, dto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.kybApplication.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when application not found', async () => {
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(null);

      await expect(
        service.reviewApplication(appId, reviewerId, { status: 'approved' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log audit event on review', async () => {
      const dto = { status: 'approved', reviewNotes: 'Good' };
      mockPrismaService.kybApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.kybApplication.update.mockResolvedValue({ ...mockApp, status: 'approved' });
      mockPrismaService.agentProfile.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.reviewApplication(appId, reviewerId, dto);

      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId: reviewerId,
        action: 'kyb_application_approved',
        entityType: 'kyb_application',
        entityId: appId,
        metadata: { reviewNotes: 'Good' },
      });
    });
  });
});
