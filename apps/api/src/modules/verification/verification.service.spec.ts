import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('VerificationService', () => {
  let service: VerificationService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    verificationChecklist: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    submission: {
      update: jest.fn(),
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
        VerificationService,
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

    service = module.get<VerificationService>(VerificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =============================================
  // getChecklist
  // =============================================
  describe('getChecklist', () => {
    const submissionId = 'sub-1';

    const mockChecklist = {
      id: 'cl-1',
      submissionId,
      identityVerified: true,
      employmentVerified: true,
      referencesVerified: false,
      addressVerified: true,
      criminalCheckDone: false,
      fieldVisitCompleted: false,
      completedAt: null,
      notes: null,
      submission: {
        id: submissionId,
        tenantName: 'John Doe',
        status: 'in_progress',
        agentId: 'agent-1',
      },
    };

    it('should return checklist with completion percentage', async () => {
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue(mockChecklist);

      const result = await service.getChecklist(submissionId);

      expect(result.completedCount).toBe(3);
      expect(result.totalItems).toBe(6);
      expect(result.completionPercent).toBe(50);
      expect(result.submissionId).toBe(submissionId);
    });

    it('should throw NotFoundException when checklist not found', async () => {
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue(null);

      await expect(service.getChecklist(submissionId)).rejects.toThrow(NotFoundException);
    });

    it('should return 100% when all items are complete', async () => {
      const fullChecklist = {
        ...mockChecklist,
        identityVerified: true,
        employmentVerified: true,
        referencesVerified: true,
        addressVerified: true,
        criminalCheckDone: true,
        fieldVisitCompleted: true,
      };
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue(fullChecklist);

      const result = await service.getChecklist(submissionId);

      expect(result.completedCount).toBe(6);
      expect(result.completionPercent).toBe(100);
    });
  });

  // =============================================
  // updateChecklist
  // =============================================
  describe('updateChecklist', () => {
    const submissionId = 'sub-1';
    const userId = 'ops-user-1';

    const baseChecklist = {
      id: 'cl-1',
      submissionId,
      identityVerified: true,
      employmentVerified: true,
      referencesVerified: true,
      addressVerified: true,
      criminalCheckDone: true,
      fieldVisitCompleted: false,
      completedAt: null,
      notes: null,
      submission: {
        agentId: 'agent-1',
        tenantName: 'John Doe',
      },
    };

    it('should perform partial update on checklist', async () => {
      const dto = { identityVerified: true };
      const partialChecklist = {
        ...baseChecklist,
        identityVerified: false,
        employmentVerified: false,
        fieldVisitCompleted: false,
      };

      mockPrismaService.verificationChecklist.findUnique
        .mockResolvedValueOnce(partialChecklist) // for updateChecklist lookup
        .mockResolvedValueOnce({ // for getChecklist call at end
          ...partialChecklist,
          identityVerified: true,
          submission: { id: submissionId, tenantName: 'John Doe', status: 'in_progress', agentId: 'agent-1' },
        });

      mockPrismaService.verificationChecklist.update.mockResolvedValue({
        ...partialChecklist,
        identityVerified: true,
      });

      const result = await service.updateChecklist(submissionId, userId, dto);

      expect(mockPrismaService.verificationChecklist.update).toHaveBeenCalledWith({
        where: { submissionId },
        data: { identityVerified: true },
      });
    });

    it('should reject fieldVisitCompleted from ops (only set by field agent visit)', async () => {
      const dto = { fieldVisitCompleted: true };

      mockPrismaService.verificationChecklist.findUnique.mockResolvedValueOnce(baseChecklist);

      await expect(
        service.updateChecklist(submissionId, userId, dto),
      ).rejects.toThrow('Field Visit is automatically verified when the field agent submits their visit report');
    });

    it('should set completedAt when all 6 items are complete', async () => {
      const dto = { criminalCheckDone: true };
      // fieldVisitCompleted already true in this scenario (set by field agent)
      const checklistWithVisit = {
        ...baseChecklist,
        fieldVisitCompleted: true,
      };

      mockPrismaService.verificationChecklist.findUnique
        .mockResolvedValueOnce(checklistWithVisit)
        .mockResolvedValueOnce({
          ...checklistWithVisit,
          criminalCheckDone: true,
          completedAt: null,
          submission: { id: submissionId, tenantName: 'John Doe', status: 'field_visit', agentId: 'agent-1' },
        });

      mockPrismaService.verificationChecklist.update.mockResolvedValue({
        ...checklistWithVisit,
        criminalCheckDone: true,
      });

      mockPrismaService.submission.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.updateChecklist(submissionId, userId, dto);

      expect(mockPrismaService.verificationChecklist.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.verificationChecklist.update).toHaveBeenNthCalledWith(2, {
        where: { submissionId },
        data: { completedAt: expect.any(Date) },
      });
    });

    it('should transition submission to report_building when all complete', async () => {
      const dto = { criminalCheckDone: true };
      const checklistWithVisit = {
        ...baseChecklist,
        fieldVisitCompleted: true,
      };

      mockPrismaService.verificationChecklist.findUnique
        .mockResolvedValueOnce(checklistWithVisit)
        .mockResolvedValueOnce({
          ...checklistWithVisit,
          criminalCheckDone: true,
          completedAt: null,
          submission: { id: submissionId, tenantName: 'John Doe', status: 'field_visit', agentId: 'agent-1' },
        });

      mockPrismaService.verificationChecklist.update.mockResolvedValue({
        ...checklistWithVisit,
        criminalCheckDone: true,
      });
      mockPrismaService.submission.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.updateChecklist(submissionId, userId, dto);

      expect(mockPrismaService.submission.update).toHaveBeenCalledWith({
        where: { id: submissionId },
        data: { status: 'report_building' },
      });
    });

    it('should notify agent on full completion', async () => {
      const dto = { criminalCheckDone: true };
      const checklistWithVisit = {
        ...baseChecklist,
        fieldVisitCompleted: true,
      };

      mockPrismaService.verificationChecklist.findUnique
        .mockResolvedValueOnce(checklistWithVisit)
        .mockResolvedValueOnce({
          ...checklistWithVisit,
          criminalCheckDone: true,
          completedAt: null,
          submission: { id: submissionId, tenantName: 'John Doe', status: 'field_visit', agentId: 'agent-1' },
        });

      mockPrismaService.verificationChecklist.update.mockResolvedValue({
        ...checklistWithVisit,
        criminalCheckDone: true,
      });
      mockPrismaService.submission.update.mockResolvedValue({});
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      await service.updateChecklist(submissionId, userId, dto);

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-1',
          type: 'submission_update',
          title: 'Verification Complete',
        }),
      );
    });

    it('should NOT notify on partial update', async () => {
      const dto = { identityVerified: true };
      const partialChecklist = {
        ...baseChecklist,
        identityVerified: false,
        employmentVerified: false,
        fieldVisitCompleted: false,
      };

      mockPrismaService.verificationChecklist.findUnique
        .mockResolvedValueOnce(partialChecklist)
        .mockResolvedValueOnce({
          ...partialChecklist,
          identityVerified: true,
          submission: { id: submissionId, tenantName: 'John Doe', status: 'in_progress', agentId: 'agent-1' },
        });

      // Returns partial — not all complete
      mockPrismaService.verificationChecklist.update.mockResolvedValue({
        ...partialChecklist,
        identityVerified: true,
      });
      mockAuditService.log.mockResolvedValue({});

      await service.updateChecklist(submissionId, userId, dto);

      expect(mockNotificationsService.emit).not.toHaveBeenCalled();
    });

    it('should log audit event', async () => {
      const dto = { identityVerified: true };
      const partialChecklist = {
        ...baseChecklist,
        identityVerified: false,
        employmentVerified: false,
        fieldVisitCompleted: false,
      };

      mockPrismaService.verificationChecklist.findUnique
        .mockResolvedValueOnce(partialChecklist)
        .mockResolvedValueOnce({
          ...partialChecklist,
          identityVerified: true,
          submission: { id: submissionId, tenantName: 'John Doe', status: 'in_progress', agentId: 'agent-1' },
        });

      mockPrismaService.verificationChecklist.update.mockResolvedValue({
        ...partialChecklist,
        identityVerified: true,
      });
      mockAuditService.log.mockResolvedValue({});

      await service.updateChecklist(submissionId, userId, dto);

      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId,
        action: 'checklist_updated',
        entityType: 'verification_checklist',
        entityId: 'cl-1',
        metadata: { identityVerified: true },
      });
    });

    // Regression: the field agent's visit report flips fieldVisitCompleted
    // directly. Nothing used to re-evaluate completion afterwards, so when ops
    // finished its five checks first (the natural order, while the case is
    // still in field_visit) the checklist was never finalized and the case
    // could never reach report_building.
    it('finalizes when the field visit was the last outstanding item', async () => {
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue({
        ...baseChecklist,
        fieldVisitCompleted: true,
        completedAt: null,
        submission: {
          id: submissionId,
          agentId: 'agent-1',
          tenantName: 'John Doe',
          status: 'field_visit',
        },
      });
      mockPrismaService.verificationChecklist.update.mockResolvedValue({});
      mockPrismaService.submission.update.mockResolvedValue({});

      await service.finalizeIfComplete(submissionId);

      expect(mockPrismaService.verificationChecklist.update).toHaveBeenCalledWith({
        where: { submissionId },
        data: { completedAt: expect.any(Date) },
      });
      expect(mockPrismaService.submission.update).toHaveBeenCalledWith({
        where: { id: submissionId },
        data: { status: 'report_building' },
      });
    });

    it('does nothing when items are still outstanding', async () => {
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue({
        ...baseChecklist,
        fieldVisitCompleted: false,
        completedAt: null,
        submission: { id: submissionId, agentId: 'agent-1', tenantName: 'John', status: 'field_visit' },
      });

      await service.finalizeIfComplete(submissionId);

      expect(mockPrismaService.verificationChecklist.update).not.toHaveBeenCalled();
      expect(mockPrismaService.submission.update).not.toHaveBeenCalled();
    });

    it('is idempotent once already finalized', async () => {
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue({
        ...baseChecklist,
        fieldVisitCompleted: true,
        completedAt: new Date(),
        submission: { id: submissionId, agentId: 'agent-1', tenantName: 'John', status: 'report_building' },
      });

      await service.finalizeIfComplete(submissionId);

      expect(mockPrismaService.verificationChecklist.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when checklist not found for update', async () => {
      mockPrismaService.verificationChecklist.findUnique.mockResolvedValue(null);

      await expect(
        service.updateChecklist(submissionId, userId, { identityVerified: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
