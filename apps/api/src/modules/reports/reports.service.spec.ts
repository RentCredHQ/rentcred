import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'mock-uuid-token'),
}));

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    submission: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    verificationChecklist: {
      findUnique: jest.fn(),
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
        ReportsService,
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

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── generate ────────────────────────────────────────────────────────

  describe('generate', () => {
    const submissionId = 'sub-1';
    const userId = 'ops-1';

    const mockSubmission = {
      id: submissionId,
      tenantName: 'John Doe',
      tenantEmail: 'john@example.com',
      tenantPhone: '08012345678',
      propertyAddress: '12 Elm Street',
      annualRent: 1200000,
      monthlyRent: 100000,
      propertyType: 'flat',
      bedrooms: 2,
      state: 'Lagos',
      lga: 'Ikeja',
      neighborhood: 'GRA',
      landlordName: 'Mr Landlord',
      landlordPhone: '08099999999',
      propertyCondition: 'good',
      propertyImages: ['img1.jpg'],
      employerName: 'Acme Corp',
      employerAddress: '1 Victoria Island',
      monthlyIncome: 300000,
      report: null,
      verificationChecklist: {
        identityVerified: true,
        employmentVerified: true,
        referencesVerified: false,
        addressVerified: true,
        criminalCheckDone: false,
        fieldVisitCompleted: true,
        completedAt: new Date('2025-01-01'),
      },
      fieldVisits: [
        {
          visitDate: new Date('2025-01-15'),
          gpsLatitude: 6.5,
          gpsLongitude: 3.4,
          summary: 'Property verified',
          photos: ['photo1.jpg'],
        },
      ],
    };

    it('should compile content from submission + checklist + field visit', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      const mockReport = { id: 'report-1', submissionId, content: {}, status: 'draft' };
      mockPrismaService.report.create.mockResolvedValue(mockReport);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.generate(submissionId, userId);

      expect(result).toEqual(mockReport);
      expect(mockPrismaService.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionId,
          status: 'draft',
          content: expect.objectContaining({
            tenant: expect.objectContaining({ name: 'John Doe' }),
            property: expect.objectContaining({ address: '12 Elm Street' }),
            employment: expect.objectContaining({ employer: 'Acme Corp' }),
            verification: expect.objectContaining({ identityVerified: true }),
            fieldVisit: expect.objectContaining({
              gps: { lat: 6.5, lng: 3.4 },
              summary: 'Property verified',
            }),
          }),
        }),
      });
    });

    it('should throw BadRequestException when report already exists', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        report: { id: 'existing-report' },
      });

      await expect(service.generate(submissionId, userId)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.report.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(service.generate('nonexistent', userId)).rejects.toThrow(NotFoundException);
    });

    it('should log audit entry', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      const mockReport = { id: 'report-1', submissionId, content: {}, status: 'draft' };
      mockPrismaService.report.create.mockResolvedValue(mockReport);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.generate(submissionId, userId);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          action: 'report_generated',
          entityType: 'report',
          entityId: 'report-1',
          metadata: { submissionId },
        }),
      );
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────

  describe('findAll', () => {
    const mockReports = [
      { id: 'r-1', status: 'draft', submission: { agentId: 'agent-1' } },
      { id: 'r-2', status: 'approved', submission: { agentId: 'agent-1' } },
    ];

    it('should filter by agent submission when role is agent', async () => {
      mockPrismaService.report.findMany.mockResolvedValue(mockReports);
      mockPrismaService.report.count.mockResolvedValue(2);

      await service.findAll({ userId: 'agent-1', role: 'agent' });

      expect(mockPrismaService.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            submission: { agentId: 'agent-1' },
          }),
        }),
      );
    });

    it('should not filter by agent when role is ops', async () => {
      mockPrismaService.report.findMany.mockResolvedValue(mockReports);
      mockPrismaService.report.count.mockResolvedValue(2);

      await service.findAll({ userId: 'ops-1', role: 'ops' });

      const callArgs = mockPrismaService.report.findMany.mock.calls[0][0];
      expect(callArgs.where.submission).toBeUndefined();
    });

    it('should return correct pagination structure', async () => {
      mockPrismaService.report.findMany.mockResolvedValue(mockReports);
      mockPrismaService.report.count.mockResolvedValue(40);

      const result = await service.findAll({ userId: 'ops-1', role: 'ops', page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 40,
        totalPages: 4,
      });
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────

  describe('findOne', () => {
    const mockReport = {
      id: 'report-1',
      submissionId: 'sub-1',
      status: 'approved',
      content: {},
      submission: {
        id: 'sub-1',
        agentId: 'agent-1',
        tenantName: 'John',
        agent: { id: 'agent-1', name: 'Agent', email: 'agent@test.com' },
      },
    };

    it('should return report with submission data', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      const result = await service.findOne('report-1', 'agent-1', 'agent');

      expect(result).toEqual(mockReport);
    });

    it('should throw ForbiddenException when agent accesses another agent report', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      await expect(service.findOne('report-1', 'agent-other', 'agent')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when report not found', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'agent-1', 'agent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow ops to view any report', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      const result = await service.findOne('report-1', 'ops-1', 'ops');

      expect(result).toEqual(mockReport);
    });
  });

  // ─── review ──────────────────────────────────────────────────────────

  describe('review', () => {
    const mockReport = {
      id: 'report-1',
      submissionId: 'sub-1',
      status: 'draft',
      submission: { agentId: 'agent-1', tenantName: 'John Doe' },
    };

    it('should approve and set approvedBy + approvedAt', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      const updatedReport = {
        ...mockReport,
        status: 'approved',
        approvedBy: 'ops-1',
        approvedAt: expect.any(Date),
      };
      mockPrismaService.report.update.mockResolvedValue(updatedReport);
      mockPrismaService.submission.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.review('report-1', 'ops-1', { status: 'approved' });

      expect(mockPrismaService.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: {
          status: 'approved',
          approvedBy: 'ops-1',
          approvedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('approved');
    });

    it('should mark submission completed on approval', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      mockPrismaService.report.update.mockResolvedValue({ ...mockReport, status: 'approved' });
      mockPrismaService.submission.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.review('report-1', 'ops-1', { status: 'approved' });

      expect(mockPrismaService.submission.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: 'completed' },
      });
    });

    it('should not mark submission completed on rejection', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      mockPrismaService.report.update.mockResolvedValue({ ...mockReport, status: 'rejected' });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.review('report-1', 'ops-1', { status: 'rejected', notes: 'Needs work' });

      expect(mockPrismaService.submission.update).not.toHaveBeenCalled();
    });

    it('should notify agent on rejection', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      mockPrismaService.report.update.mockResolvedValue({ ...mockReport, status: 'rejected' });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.review('report-1', 'ops-1', { status: 'rejected', notes: 'Needs revision' });

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-1',
          type: 'report_ready',
          title: 'Report Rejected',
        }),
      );
    });

    it('should log audit entry', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      mockPrismaService.report.update.mockResolvedValue({ ...mockReport, status: 'approved' });
      mockPrismaService.submission.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.review('report-1', 'ops-1', { status: 'approved' });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'ops-1',
          action: 'report_approved',
          entityType: 'report',
          entityId: 'report-1',
        }),
      );
    });

    it('should throw NotFoundException when report not found', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(
        service.review('nonexistent', 'ops-1', { status: 'approved' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      await expect(
        service.review('report-1', 'ops-1', { status: 'invalid' as any }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── share ───────────────────────────────────────────────────────────

  describe('share', () => {
    const mockReport = {
      id: 'report-1',
      submissionId: 'sub-1',
      status: 'approved',
      shareToken: null,
      sharedAt: null,
      submission: { agentId: 'agent-1' },
    };

    it('should generate shareToken using randomUUID', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);
      mockPrismaService.report.update.mockResolvedValue({
        ...mockReport,
        shareToken: 'mock-uuid-token',
        sharedAt: new Date(),
      });

      const result = await service.share('report-1', 'agent-1');

      expect(result).toHaveProperty('shareToken', 'mock-uuid-token');
      expect(result).toHaveProperty('shareUrl');
      expect(result.shareUrl).toContain('mock-uuid-token');
    });

    it('should throw BadRequestException for unapproved report', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        status: 'draft',
      });

      await expect(service.share('report-1', 'agent-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when non-owning agent tries to share', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      await expect(service.share('report-1', 'agent-other')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when report not found', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.share('nonexistent', 'agent-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByShareToken ────────────────────────────────────────────────

  describe('findByShareToken', () => {
    const mockReport = {
      id: 'report-1',
      content: { tenant: { name: 'John' } },
      status: 'approved',
      approvedAt: new Date('2025-01-20'),
      sharedAt: new Date('2025-01-21'),
      submission: {
        tenantName: 'John',
        propertyAddress: '12 Elm Street',
        annualRent: 1200000,
        monthlyRent: 100000,
        propertyType: 'flat',
        bedrooms: 2,
        state: 'Lagos',
        lga: 'Ikeja',
        neighborhood: 'GRA',
        propertyImages: [],
      },
    };

    it('should return report data for valid share token', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(mockReport);

      const result = await service.findByShareToken('valid-token');

      expect(result).toHaveProperty('id', 'report-1');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('submission');
      expect(result).toHaveProperty('approvedAt');
      expect(result).toHaveProperty('sharedAt');
    });

    it('should throw NotFoundException when token not found', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.findByShareToken('bad-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when report is not approved', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        status: 'draft',
      });

      await expect(service.findByShareToken('valid-token')).rejects.toThrow(NotFoundException);
    });
  });
});
