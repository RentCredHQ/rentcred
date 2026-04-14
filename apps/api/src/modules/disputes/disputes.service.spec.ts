import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('DisputesService', () => {
  let service: DisputesService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    submission: {
      findUnique: jest.fn(),
    },
    dispute: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
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
        DisputesService,
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

    service = module.get<DisputesService>(DisputesService);
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
    const userId = 'user-1';
    const createDto = {
      submissionId: 'sub-1',
      reason: 'Incorrect information',
      description: 'The address listed is wrong.',
    };

    const mockSubmission = {
      id: 'sub-1',
      agentId: 'agent-1',
      tenantName: 'John Doe',
      propertyAddress: '12 Elm Street',
    };

    const mockDispute = {
      id: 'dispute-1',
      submissionId: 'sub-1',
      raisedById: userId,
      reason: createDto.reason,
      description: createDto.description,
      status: 'open',
    };

    it('should create a dispute with open status', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.dispute.create.mockResolvedValue(mockDispute);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockDispute);
      expect(result.status).toBe('open');
      expect(mockPrismaService.dispute.create).toHaveBeenCalledWith({
        data: {
          submissionId: createDto.submissionId,
          raisedById: userId,
          reason: createDto.reason,
          description: createDto.description,
          status: 'open',
        },
      });
    });

    it('should notify the raiser with a confirmation', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.dispute.create.mockResolvedValue(mockDispute);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(userId, createDto);

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type: 'dispute_update',
          title: 'Dispute Filed',
        }),
      );
    });

    it('should notify the submission agent if different from raiser', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.dispute.create.mockResolvedValue(mockDispute);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(userId, createDto);

      // First call is raiser notification, second is agent notification
      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-1',
          type: 'dispute_update',
          title: 'Dispute Filed on Your Submission',
        }),
      );
    });

    it('should not notify agent separately if raiser is the agent', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        agentId: userId, // raiser IS the agent
      });
      mockPrismaService.dispute.create.mockResolvedValue(mockDispute);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(userId, createDto);

      // Only 1 call (raiser confirmation), no separate agent notification
      const agentCalls = mockNotificationsService.emit.mock.calls.filter(
        (call: any[]) => call[0].title === 'Dispute Filed on Your Submission',
      );
      expect(agentCalls).toHaveLength(0);
    });

    it('should notify all ops users', async () => {
      const opsUsers = [{ id: 'ops-1' }, { id: 'ops-2' }];
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.dispute.create.mockResolvedValue(mockDispute);
      mockPrismaService.user.findMany.mockResolvedValue(opsUsers);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(userId, createDto);

      // Should notify both ops users
      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'ops-1',
          title: 'New Dispute Requires Attention',
        }),
      );
      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'ops-2',
          title: 'New Dispute Requires Attention',
        }),
      );
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.dispute.create).not.toHaveBeenCalled();
    });

    it('should log audit entry', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.dispute.create.mockResolvedValue(mockDispute);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.create(userId, createDto);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          action: 'dispute_created',
          entityType: 'dispute',
          entityId: 'dispute-1',
          metadata: { submissionId: createDto.submissionId, reason: createDto.reason },
        }),
      );
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────

  describe('findAll', () => {
    const mockDisputes = [
      { id: 'd-1', status: 'open', raisedById: 'user-1' },
      { id: 'd-2', status: 'resolved', raisedById: 'user-1' },
    ];

    it('should filter by raisedById for non-ops users', async () => {
      mockPrismaService.dispute.findMany.mockResolvedValue(mockDisputes);
      mockPrismaService.dispute.count.mockResolvedValue(2);

      await service.findAll({ userId: 'user-1', role: 'agent' });

      expect(mockPrismaService.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ raisedById: 'user-1' }),
        }),
      );
    });

    it('should not filter by raisedById for ops users', async () => {
      mockPrismaService.dispute.findMany.mockResolvedValue(mockDisputes);
      mockPrismaService.dispute.count.mockResolvedValue(2);

      await service.findAll({ userId: 'ops-1', role: 'ops' });

      const callArgs = mockPrismaService.dispute.findMany.mock.calls[0][0];
      expect(callArgs.where.raisedById).toBeUndefined();
    });

    it('should not filter by raisedById for admin users', async () => {
      mockPrismaService.dispute.findMany.mockResolvedValue(mockDisputes);
      mockPrismaService.dispute.count.mockResolvedValue(2);

      await service.findAll({ userId: 'admin-1', role: 'admin' });

      const callArgs = mockPrismaService.dispute.findMany.mock.calls[0][0];
      expect(callArgs.where.raisedById).toBeUndefined();
    });

    it('should apply status filter', async () => {
      mockPrismaService.dispute.findMany.mockResolvedValue([]);
      mockPrismaService.dispute.count.mockResolvedValue(0);

      await service.findAll({ userId: 'ops-1', role: 'ops', status: 'open' });

      expect(mockPrismaService.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'open' }),
        }),
      );
    });

    it('should not apply status filter when status is "all"', async () => {
      mockPrismaService.dispute.findMany.mockResolvedValue([]);
      mockPrismaService.dispute.count.mockResolvedValue(0);

      await service.findAll({ userId: 'ops-1', role: 'ops', status: 'all' });

      const callArgs = mockPrismaService.dispute.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBeUndefined();
    });

    it('should return correct pagination structure', async () => {
      mockPrismaService.dispute.findMany.mockResolvedValue(mockDisputes);
      mockPrismaService.dispute.count.mockResolvedValue(30);

      const result = await service.findAll({ userId: 'ops-1', role: 'ops', page: 3, limit: 5 });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 30,
        totalPages: 6,
      });
      expect(mockPrismaService.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────

  describe('findOne', () => {
    const mockDispute = {
      id: 'dispute-1',
      raisedById: 'user-1',
      submission: {
        id: 'sub-1',
        agentId: 'agent-1',
        tenantName: 'John',
        tenantEmail: 'john@example.com',
        propertyAddress: '12 Elm Street',
        agent: { name: 'Agent', email: 'agent@test.com' },
      },
      raisedBy: { id: 'user-1', name: 'User', email: 'user@test.com', role: 'tenant' },
    };

    it('should allow the raiser to view', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      const result = await service.findOne('dispute-1', 'user-1', 'tenant');

      expect(result).toEqual(mockDispute);
    });

    it('should allow the submission agent to view', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      const result = await service.findOne('dispute-1', 'agent-1', 'agent');

      expect(result).toEqual(mockDispute);
    });

    it('should allow ops to view', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      const result = await service.findOne('dispute-1', 'ops-1', 'ops');

      expect(result).toEqual(mockDispute);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      await expect(service.findOne('dispute-1', 'random-user', 'tenant')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when dispute not found', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1', 'tenant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── resolve ─────────────────────────────────────────────────────────

  describe('resolve', () => {
    const mockDispute = {
      id: 'dispute-1',
      raisedById: 'user-1',
      status: 'open',
      submission: {
        agentId: 'agent-1',
        tenantName: 'John Doe',
        propertyAddress: '12 Elm Street',
        tenantEmail: 'john@example.com',
      },
    };

    it('should set resolvedBy and resolvedAt when status is resolved', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      const updatedDispute = { ...mockDispute, status: 'resolved', resolvedBy: 'ops-1' };
      mockPrismaService.dispute.update.mockResolvedValue(updatedDispute);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.resolve('dispute-1', 'ops-1', {
        status: 'resolved',
        resolution: 'Issue addressed',
      });

      expect(mockPrismaService.dispute.update).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        data: expect.objectContaining({
          status: 'resolved',
          resolution: 'Issue addressed',
          resolvedBy: 'ops-1',
          resolvedAt: expect.any(Date),
        }),
      });
      expect(result.status).toBe('resolved');
    });

    it('should set resolvedBy and resolvedAt when status is closed', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'closed' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', { status: 'closed' });

      expect(mockPrismaService.dispute.update).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        data: expect.objectContaining({
          status: 'closed',
          resolvedBy: 'ops-1',
          resolvedAt: expect.any(Date),
        }),
      });
    });

    it('should not set resolvedBy for under_review status', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'under_review' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', { status: 'under_review' });

      expect(mockPrismaService.dispute.update).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        data: { status: 'under_review' },
      });
    });

    it('should throw BadRequestException for invalid status', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      await expect(
        service.resolve('dispute-1', 'ops-1', { status: 'invalid' as any }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.dispute.update).not.toHaveBeenCalled();
    });

    it('should notify the raiser on resolve', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'resolved' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', {
        status: 'resolved',
        resolution: 'Fixed',
      });

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'dispute_update',
        }),
      );
    });

    it('should notify the submission agent if different from raiser', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'resolved' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', { status: 'resolved' });

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'agent-1',
          type: 'dispute_update',
        }),
      );
    });

    it('should notify the tenant if their email matches a user account', async () => {
      const tenantUser = { id: 'tenant-user-1', email: 'john@example.com' };
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'resolved' });
      mockPrismaService.user.findUnique.mockResolvedValue(tenantUser);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', { status: 'resolved' });

      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'tenant-user-1',
          type: 'dispute_update',
          message: expect.stringContaining('verification'),
        }),
      );
    });

    it('should not notify tenant if tenant user is the raiser', async () => {
      const tenantUser = { id: 'user-1', email: 'john@example.com' }; // same as raisedById
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'resolved' });
      mockPrismaService.user.findUnique.mockResolvedValue(tenantUser);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', { status: 'resolved' });

      // Should NOT have a tenant-specific notification (tenant is the raiser)
      const tenantCalls = mockNotificationsService.emit.mock.calls.filter(
        (call: any[]) => call[0].message?.includes('verification'),
      );
      expect(tenantCalls).toHaveLength(0);
    });

    it('should throw NotFoundException when dispute not found', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(null);

      await expect(
        service.resolve('nonexistent', 'ops-1', { status: 'resolved' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log audit entry', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({ ...mockDispute, status: 'resolved' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.resolve('dispute-1', 'ops-1', {
        status: 'resolved',
        resolution: 'Fixed the issue',
      });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'ops-1',
          action: 'dispute_resolved',
          entityType: 'dispute',
          entityId: 'dispute-1',
          metadata: { resolution: 'Fixed the issue' },
        }),
      );
    });
  });
});
