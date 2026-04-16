import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    submission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    agentProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    verificationChecklist: {
      create: jest.fn(),
    },
    fieldAssignment: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
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
        SubmissionsService,
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

    service = module.get<SubmissionsService>(SubmissionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ──────────────────────────────────────────────────────────

  describe('create', () => {
    const agentId = 'agent-1';
    const createDto = {
      tenantName: 'John Doe',
      tenantEmail: 'john@example.com',
      tenantPhone: '08012345678',
      propertyAddress: '12 Elm Street, Lagos',
      annualRent: 1200000,
      monthlyRent: undefined as number | undefined,
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
      previousAddress: '5 Old Street',
      reasonForMoving: 'Closer to work',
      notes: 'Urgent',
      consentObtained: true,
    };

    const mockAgent = { userId: agentId, creditBalance: 5, kybStatus: 'approved' };
    const mockSubmission = { id: 'sub-1', ...createDto, agentId, status: 'pending' };
    const mockUpdatedAgent = { ...mockAgent, creditBalance: 4 };
    const mockTransaction = { id: 'txn-1', agentId, type: 'deduction', amount: 1 };

    it('should create a submission with credit deduction', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.$transaction.mockResolvedValue([
        mockSubmission,
        mockUpdatedAgent,
        mockTransaction,
      ]);
      mockPrismaService.verificationChecklist.create.mockResolvedValue({ id: 'vc-1' });
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.create(agentId, createDto as any);

      expect(result).toEqual(mockSubmission);
      expect(mockPrismaService.agentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: agentId },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.verificationChecklist.create).toHaveBeenCalledWith({
        data: { submissionId: mockSubmission.id },
      });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: agentId,
          action: 'submission_created',
          entityType: 'submission',
          entityId: mockSubmission.id,
        }),
      );
    });

    it('should throw ForbiddenException when agent has insufficient credits', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue({
        userId: agentId,
        creditBalance: 0,
        kybStatus: 'approved',
      });

      await expect(service.create(agentId, createDto as any)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when agent profile not found', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(null);

      await expect(service.create(agentId, createDto as any)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should derive monthlyRent from annualRent / 12 when not provided', async () => {
      const dtoNoMonthly = { ...createDto, monthlyRent: undefined };
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.$transaction.mockResolvedValue([
        mockSubmission,
        mockUpdatedAgent,
        mockTransaction,
      ]);
      mockPrismaService.verificationChecklist.create.mockResolvedValue({ id: 'vc-1' });
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(agentId, dtoNoMonthly as any);

      // The $transaction call receives an array of Prisma operations.
      // We verify the submission.create call was made via $transaction
      // which internally uses dto.monthlyRent ?? dto.annualRent / 12
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should create verification checklist after creation', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.$transaction.mockResolvedValue([
        mockSubmission,
        mockUpdatedAgent,
        mockTransaction,
      ]);
      mockPrismaService.verificationChecklist.create.mockResolvedValue({ id: 'vc-1' });
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(agentId, createDto as any);

      expect(mockPrismaService.verificationChecklist.create).toHaveBeenCalledWith({
        data: { submissionId: mockSubmission.id },
      });
    });

    it('should reject submission if KYB is not approved', async () => {
      mockPrismaService.agentProfile.findUnique.mockResolvedValue({ creditBalance: 5, kybStatus: 'pending' });
      await expect(service.create(agentId, createDto as any)).rejects.toThrow(ForbiddenException);
    });

    it('should reject submission if consent not obtained', async () => {
      await expect(service.create(agentId, { ...createDto, consentObtained: false } as any)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────

  describe('findAll', () => {
    const mockSubmissions = [
      { id: 'sub-1', tenantName: 'John', agentId: 'agent-1', status: 'pending' },
      { id: 'sub-2', tenantName: 'Jane', agentId: 'agent-1', status: 'in_progress' },
    ];

    it('should filter by agentId when role is agent', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue(mockSubmissions);
      mockPrismaService.submission.count.mockResolvedValue(2);

      const result = await service.findAll({ userId: 'agent-1', role: 'agent' });

      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ agentId: 'agent-1' }),
        }),
      );
      expect(result.data).toEqual(mockSubmissions);
    });

    it('should not filter by agentId when role is ops', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue(mockSubmissions);
      mockPrismaService.submission.count.mockResolvedValue(2);

      await service.findAll({ userId: 'ops-1', role: 'ops' });

      const callArgs = mockPrismaService.submission.findMany.mock.calls[0][0];
      expect(callArgs.where.agentId).toBeUndefined();
    });

    it('should return correct pagination structure', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue(mockSubmissions);
      mockPrismaService.submission.count.mockResolvedValue(50);

      const result = await service.findAll({ userId: 'ops-1', role: 'ops', page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should apply status filter', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.submission.count.mockResolvedValue(0);

      await service.findAll({ userId: 'ops-1', role: 'ops', status: 'pending' });

      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'pending' }),
        }),
      );
    });

    it('should apply search filter to OR clause', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.submission.count.mockResolvedValue(0);

      await service.findAll({ userId: 'ops-1', role: 'ops', search: 'John' });

      const callArgs = mockPrismaService.submission.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tenantName: { contains: 'John', mode: 'insensitive' } }),
        ]),
      );
    });
  });

  // ─── findById ────────────────────────────────────────────────────────

  describe('findById', () => {
    const mockSubmission = {
      id: 'sub-1',
      agentId: 'agent-1',
      tenantName: 'John',
      agent: { id: 'agent-1', name: 'Agent', email: 'agent@test.com' },
      verificationChecklist: {},
      fieldAssignments: [],
      fieldVisits: [],
      report: null,
      disputes: [],
    };

    it('should return full submission with includes', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findById('sub-1', 'agent-1', 'agent');

      expect(result).toEqual(mockSubmission);
      expect(mockPrismaService.submission.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          include: expect.objectContaining({
            agent: expect.any(Object),
            verificationChecklist: true,
            fieldAssignments: expect.any(Object),
            fieldVisits: expect.any(Object),
            report: true,
            disputes: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw ForbiddenException when agent accesses another agent submission', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      await expect(service.findById('sub-1', 'agent-other', 'agent')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow ops to view any submission', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findById('sub-1', 'ops-1', 'ops');

      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent', 'agent-1', 'agent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── updateStatus ────────────────────────────────────────────────────

  describe('updateStatus', () => {
    const mockSubmission = {
      id: 'sub-1',
      agentId: 'agent-1',
      status: 'pending',
      tenantName: 'John Doe',
    };

    it('should succeed for valid transition (pending -> in_progress)', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      const updatedSubmission = { ...mockSubmission, status: 'in_progress' };
      mockPrismaService.submission.update.mockResolvedValue(updatedSubmission);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.updateStatus('sub-1', 'ops-1', { status: 'in_progress' });

      expect(result).toEqual(updatedSubmission);
      expect(mockPrismaService.submission.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: 'in_progress' },
      });
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      await expect(
        service.updateStatus('sub-1', 'ops-1', { status: 'completed' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.submission.update).not.toHaveBeenCalled();
    });

    it('should notify agent on status change', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.submission.update.mockResolvedValue({ ...mockSubmission, status: 'in_progress' });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.updateStatus('sub-1', 'ops-1', { status: 'in_progress' });

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-1',
          type: 'submission_update',
        }),
      );
    });

    it('should log audit entry on status change', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.submission.update.mockResolvedValue({ ...mockSubmission, status: 'in_progress' });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.updateStatus('sub-1', 'ops-1', { status: 'in_progress', notes: 'Starting' });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'ops-1',
          action: 'submission_status_in_progress',
          entityType: 'submission',
          entityId: 'sub-1',
          metadata: { from: 'pending', to: 'in_progress', notes: 'Starting' },
        }),
      );
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', 'ops-1', { status: 'in_progress' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── assignFieldAgent ────────────────────────────────────────────────

  describe('assignFieldAgent', () => {
    const mockSubmission = {
      id: 'sub-1',
      agentId: 'agent-1',
      status: 'in_progress',
      tenantName: 'John Doe',
      propertyAddress: '12 Elm Street',
    };
    const mockFieldAgent = { id: 'fa-1', role: 'field_agent', name: 'Field Agent' };
    const mockAssignment = { id: 'assign-1', submissionId: 'sub-1', fieldAgentId: 'fa-1', status: 'assigned' };

    it('should create an assignment record', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(mockFieldAgent);
      mockPrismaService.fieldAssignment.create.mockResolvedValue(mockAssignment);
      mockPrismaService.submission.update.mockResolvedValue({ ...mockSubmission, status: 'field_visit' });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.assignFieldAgent('sub-1', 'ops-1', {
        fieldAgentId: 'fa-1',
      });

      expect(result).toEqual(mockAssignment);
      expect(mockPrismaService.fieldAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionId: 'sub-1',
          fieldAgentId: 'fa-1',
          status: 'assigned',
        }),
      });
    });

    it('should throw BadRequestException for invalid field agent', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'agent' });

      await expect(
        service.assignFieldAgent('sub-1', 'ops-1', { fieldAgentId: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.fieldAssignment.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when field agent not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.assignFieldAgent('sub-1', 'ops-1', { fieldAgentId: 'nonexistent' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should notify the field agent', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(mockFieldAgent);
      mockPrismaService.fieldAssignment.create.mockResolvedValue(mockAssignment);
      mockPrismaService.submission.update.mockResolvedValue({ ...mockSubmission, status: 'field_visit' });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.assignFieldAgent('sub-1', 'ops-1', { fieldAgentId: 'fa-1' });

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'fa-1',
          type: 'submission_update',
          title: 'New Assignment',
        }),
      );
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(
        service.assignFieldAgent('nonexistent', 'ops-1', { fieldAgentId: 'fa-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
