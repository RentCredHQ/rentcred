import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { createHmac } from 'crypto';

// Save original env
const originalEnv = { ...process.env };

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    creditBundle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    agentProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockNotificationsService = {
    emit: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  // Mock global fetch
  const mockFetch = jest.fn();

  beforeAll(() => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret_key';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    global.fetch = mockFetch as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
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

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =============================================
  // getBundles
  // =============================================
  describe('getBundles', () => {
    it('should return active bundles ordered by credits ascending', async () => {
      const mockBundles = [
        { id: 'b1', name: 'Starter', credits: 5, priceNgn: 2500, active: true },
        { id: 'b2', name: 'Pro', credits: 20, priceNgn: 8000, active: true },
      ];
      mockPrismaService.creditBundle.findMany.mockResolvedValue(mockBundles);

      const result = await service.getBundles();

      expect(result).toEqual(mockBundles);
      expect(mockPrismaService.creditBundle.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { credits: 'asc' },
      });
    });
  });

  // =============================================
  // purchaseBundle
  // =============================================
  describe('purchaseBundle', () => {
    const userId = 'user-1';
    const dto = { bundleId: 'bundle-1' };

    const mockBundle = {
      id: 'bundle-1',
      name: 'Starter',
      credits: 10,
      priceNgn: 5000,
      active: true,
    };

    const mockAgent = { id: 'agent-1', userId };
    const mockUser = { id: userId, email: 'agent@test.com' };
    const mockTransaction = {
      id: 'txn-1',
      agentId: userId,
      type: 'purchase',
      amount: 10,
      status: 'pending',
    };

    it('should create a pending transaction and return Paystack authorization URL', async () => {
      mockPrismaService.creditBundle.findUnique.mockResolvedValue(mockBundle);
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.update.mockResolvedValue(mockTransaction);

      mockFetch.mockResolvedValue({
        json: async () => ({
          status: true,
          data: {
            authorization_url: 'https://paystack.com/pay/abc',
            access_code: 'access-code-123',
            reference: 'ref-123',
          },
        }),
      });

      const result = await service.purchaseBundle(userId, dto);

      expect(result).toHaveProperty('authorizationUrl', 'https://paystack.com/pay/abc');
      expect(result).toHaveProperty('accessCode', 'access-code-123');
      expect(result).toHaveProperty('reference', 'ref-123');
      expect(result).toHaveProperty('transactionId', 'txn-1');
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agentId: userId,
          type: 'purchase',
          amount: mockBundle.credits,
          status: 'pending',
        }),
      });
    });

    it('should throw NotFoundException when bundle not found', async () => {
      mockPrismaService.creditBundle.findUnique.mockResolvedValue(null);

      await expect(service.purchaseBundle(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when bundle is inactive', async () => {
      mockPrismaService.creditBundle.findUnique.mockResolvedValue({
        ...mockBundle,
        active: false,
      });

      await expect(service.purchaseBundle(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not an agent', async () => {
      mockPrismaService.creditBundle.findUnique.mockResolvedValue(mockBundle);
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(null);

      await expect(service.purchaseBundle(userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.creditBundle.findUnique.mockResolvedValue(mockBundle);
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.purchaseBundle(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when Paystack initialization fails', async () => {
      mockPrismaService.creditBundle.findUnique.mockResolvedValue(mockBundle);
      mockPrismaService.agentProfile.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      mockFetch.mockResolvedValue({
        json: async () => ({ status: false, message: 'Failed' }),
      });

      await expect(service.purchaseBundle(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  // =============================================
  // getHistory
  // =============================================
  describe('getHistory', () => {
    const userId = 'user-1';

    it('should return paginated transactions', async () => {
      const mockTransactions = [
        { id: 'txn-1', agentId: userId, type: 'purchase', amount: 10 },
        { id: 'txn-2', agentId: userId, type: 'deduction', amount: -1 },
      ];
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(2);

      const result = await service.getHistory(userId, { page: 1, limit: 20 });

      expect(result.data).toEqual(mockTransactions);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agentId: userId },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should apply type filter when provided', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.getHistory(userId, { type: 'purchase' });

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agentId: userId, type: 'purchase' },
        }),
      );
    });

    it('should use default page and limit when not provided', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      const result = await service.getHistory(userId);

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });
  });

  // =============================================
  // getStats
  // =============================================
  describe('getStats', () => {
    it('should return aggregated stats for agent (non-ops)', async () => {
      const userId = 'user-1';

      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 100 } })
        .mockResolvedValueOnce({ _sum: { amount: 25 } });
      mockPrismaService.transaction.count.mockResolvedValue(10);

      const result = await service.getStats(userId, 'agent');

      expect(result).toEqual({
        totalSpent: 100,
        thisMonth: 25,
        transactionCount: 10,
      });
      // Verify scoped to user
      expect(mockPrismaService.transaction.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ agentId: userId }),
        }),
      );
    });

    it('should scope stats to own transactions for non-ops users', async () => {
      const userId = 'user-1';

      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50 } })
        .mockResolvedValueOnce({ _sum: { amount: 10 } });
      mockPrismaService.transaction.count.mockResolvedValue(5);

      await service.getStats(userId, 'agent');

      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ agentId: userId }),
        }),
      );
    });

    it('should see all transactions when role is ops', async () => {
      const userId = 'ops-user';

      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 500 } })
        .mockResolvedValueOnce({ _sum: { amount: 100 } });
      mockPrismaService.transaction.count.mockResolvedValue(50);

      const result = await service.getStats(userId, 'ops');

      expect(result).toEqual({
        totalSpent: 500,
        thisMonth: 100,
        transactionCount: 50,
      });
      // Verify NOT scoped to user — where should be empty
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should return 0 when no transactions exist', async () => {
      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } });
      mockPrismaService.transaction.count.mockResolvedValue(0);

      const result = await service.getStats('user-1', 'agent');

      expect(result.totalSpent).toBe(0);
      expect(result.thisMonth).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  // =============================================
  // handleWebhook
  // =============================================
  describe('handleWebhook', () => {
    const payload = {
      event: 'charge.success',
      data: {
        reference: 'txn-1',
        metadata: { bundleId: 'bundle-1', credits: 10, userId: 'user-1' },
      },
    };

    it('should process payment with valid signature', async () => {
      const secret = 'sk_test_secret_key';
      const body = JSON.stringify(payload);
      const hash = createHmac('sha512', secret).update(body).digest('hex');

      const mockTransaction = {
        id: 'txn-1',
        agentId: 'user-1',
        amount: 10,
        status: 'pending',
      };

      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);
      mockNotificationsService.emit.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      const result = await service.handleWebhook(payload, hash);

      expect(result).toEqual({ received: true });
      expect(mockPrismaService.transaction.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockNotificationsService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'payment_confirmed',
        }),
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'payment_completed',
          entityType: 'transaction',
        }),
      );
    });

    it('should throw ForbiddenException with invalid signature', async () => {
      await expect(service.handleWebhook(payload, 'invalid-sig')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.transaction.findFirst).not.toHaveBeenCalled();
    });

    it('should skip processing when no pending transaction found', async () => {
      const secret = 'sk_test_secret_key';
      const body = JSON.stringify(payload);
      const hash = createHmac('sha512', secret).update(body).digest('hex');

      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      const result = await service.handleWebhook(payload, hash);

      expect(result).toEqual({ received: true });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });
  });
});
