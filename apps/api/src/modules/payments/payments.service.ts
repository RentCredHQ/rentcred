import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { PurchaseBundleDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackSecretKey: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * List all active credit bundles.
   */
  async getBundles() {
    return this.prisma.creditBundle.findMany({
      where: { active: true },
      orderBy: { credits: 'asc' },
    });
  }

  /**
   * Initialize a Paystack transaction for a credit bundle purchase.
   */
  async purchaseBundle(userId: string, dto: PurchaseBundleDto) {
    const bundle = await this.prisma.creditBundle.findUnique({
      where: { id: dto.bundleId },
    });
    if (!bundle || !bundle.active) {
      throw new NotFoundException('Credit bundle not found or inactive');
    }

    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    if (!agent) throw new ForbiddenException('Only agents can purchase credits');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Create pending transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        agentId: userId,
        type: 'purchase',
        amount: bundle.credits,
        // Recorded so the webhook can check what Paystack actually collected
        // against what we asked for. `amount` holds credits, not naira.
        priceNgn: Math.round(bundle.priceNgn),
        bundleId: bundle.id,
        description: `Purchase: ${bundle.name} (${bundle.credits} credits)`,
        status: 'pending',
      },
    });

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(bundle.priceNgn * 100), // Paystack uses kobo
        currency: 'NGN',
        reference: transaction.id,
        callback_url: `${this.frontendUrl}/dashboard/payments?ref=${transaction.id}`,
        metadata: {
          transactionId: transaction.id,
          bundleId: bundle.id,
          bundleName: bundle.name,
          credits: bundle.credits,
          userId,
        },
      }),
    });

    const paystack = await paystackResponse.json();

    if (!paystack.status) {
      this.logger.error('Paystack initialization failed', paystack);
      throw new BadRequestException('Payment initialization failed. Please try again.');
    }

    // Store Paystack reference
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { paystackRef: paystack.data.reference },
    });

    return {
      authorizationUrl: paystack.data.authorization_url,
      accessCode: paystack.data.access_code,
      reference: paystack.data.reference,
      transactionId: transaction.id,
    };
  }

  /**
   * Verify a transaction after payment (called from frontend callback).
   */
  async verifyTransaction(reference: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        OR: [{ id: reference }, { paystackRef: reference }],
      },
    });

    // The ownership check used to be skipped entirely when no local row matched,
    // which let any authenticated agent push arbitrary references at Paystack.
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.agentId !== userId) {
      throw new ForbiddenException('Transaction does not belong to this user');
    }
    if (transaction.status === 'completed') {
      return { verified: true, message: 'Payment already confirmed' };
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
      },
    );

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return { verified: false, message: 'Payment not confirmed yet' };
    }

    // Process the successful payment
    await this.processSuccessfulPayment(data.data);

    return { verified: true, message: 'Payment confirmed' };
  }

  /**
   * Handle Paystack webhook.
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    // Verify webhook signature using raw body for integrity
    const hash = createHmac('sha512', this.paystackSecretKey)
      .update(rawBody)
      .digest('hex');

    // Constant-time compare so the comparison itself leaks nothing about the
    // expected digest. timingSafeEqual throws on length mismatch, so guard it.
    const expected = Buffer.from(hash, 'utf8');
    const provided = Buffer.from(signature ?? '', 'utf8');
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
      this.logger.warn('Invalid Paystack webhook signature');
      throw new ForbiddenException('Invalid signature');
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;

    if (event === 'charge.success') {
      await this.processSuccessfulPayment(payload.data);
    }

    return { received: true };
  }

  /**
   * Process a successful payment — credit the agent's balance.
   * Uses an interactive transaction with SELECT FOR UPDATE to prevent
   * webhook replay / double-credit attacks.
   */
  private async processSuccessfulPayment(paystackData: any) {
    const reference = paystackData.reference;

    let transaction: any;

    try {
      transaction = await this.prisma.$transaction(async (tx) => {
        // Lock the transaction row to prevent concurrent webhook replays
        const rows = await tx.$queryRawUnsafe<any[]>(
          `SELECT * FROM transactions
           WHERE (id = $1 OR paystack_ref = $1)
           FOR UPDATE`,
          reference,
        );

        const pendingTx = rows?.find((r: any) => r.status === 'pending');

        if (!pendingTx) {
          // Already processed or not found — return null for idempotency
          return null;
        }

        // Confirm Paystack actually collected what we asked for before handing
        // out credits. Note this row comes from raw SQL, so the column is
        // snake_case; `amount` on this table is credits, not naira.
        //
        // A null price means the row predates this column and cannot be
        // checked — those are credited with a warning rather than withheld,
        // since the payment itself is legitimate.
        const expectedKobo = pendingTx.price_ngn != null ? Number(pendingTx.price_ngn) * 100 : null;
        const paidKobo = Number(paystackData.amount);

        if (expectedKobo == null) {
          this.logger.warn(
            `Transaction ${pendingTx.id} has no recorded price; crediting without amount verification.`,
          );
        } else if (Number.isFinite(paidKobo) && paidKobo < expectedKobo) {
          await tx.transaction.update({
            where: { id: pendingTx.id },
            data: { status: 'failed', paystackRef: paystackData.reference },
          });
          this.logger.error(
            `Payment amount mismatch on ${pendingTx.id}: expected ${expectedKobo} kobo, received ${paidKobo}. No credits issued.`,
          );
          return { ...pendingTx, __mismatch: true, __paidKobo: paidKobo, __expectedKobo: expectedKobo };
        }

        // Update transaction status to completed
        await tx.transaction.update({
          where: { id: pendingTx.id },
          data: {
            status: 'completed',
            paystackRef: paystackData.reference,
          },
        });

        // Credit the agent's balance atomically within the same transaction
        await tx.agentProfile.update({
          where: { userId: pendingTx.agent_id },
          data: { creditBalance: { increment: pendingTx.amount } },
        });

        return pendingTx;
      });
    } catch (error: any) {
      // Handle unique constraint violation on paystackRef (idempotency guard)
      if (error?.code === 'P2002' && error?.meta?.target?.includes('paystack_ref')) {
        this.logger.warn(`Duplicate paystackRef detected for reference: ${reference}. Skipping.`);
        return;
      }
      throw error;
    }

    if (!transaction) {
      this.logger.warn(`No pending transaction found for reference: ${reference}`);
      return; // Idempotent — already processed
    }

    if (transaction.__mismatch) {
      await this.audit.log({
        userId: transaction.agent_id,
        action: 'payment_amount_mismatch',
        entityType: 'transaction',
        entityId: transaction.id,
        metadata: {
          expectedKobo: transaction.__expectedKobo,
          paidKobo: transaction.__paidKobo,
          paystackRef: paystackData.reference,
        },
      });
      return;
    }

    // Notify the agent (after transaction commits)
    await this.notifications.emit({
      userId: transaction.agent_id,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `${transaction.amount} credits have been added to your account.`,
      data: { transactionId: transaction.id, credits: transaction.amount },
    });

    await this.audit.log({
      userId: transaction.agent_id,
      action: 'payment_completed',
      entityType: 'transaction',
      entityId: transaction.id,
      metadata: {
        credits: transaction.amount,
        paystackRef: paystackData.reference,
      },
    });

    this.logger.log(
      `Payment completed: ${transaction.amount} credits for agent ${transaction.agent_id}`,
    );
  }

  /**
   * Get payment/transaction history.
   */
  async getHistory(userId: string, options?: { page?: number; limit?: number; type?: string }) {
    const safePage = Math.max(1, options?.page || 1);
    const safeLimit = Math.min(Math.max(1, options?.limit || 20), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = { agentId: userId };
    if (options?.type) where.type = options.type;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  /**
   * Get payment statistics.
   */
  async getStats(userId: string, role: string) {
    const where: any = {};
    // Non-ops/admin only see their own stats
    if (!['ops', 'admin'].includes(role)) {
      where.agentId = userId;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allPurchases, monthPurchases, totalCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'purchase', status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'purchase', status: 'completed', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      totalSpent: allPurchases._sum.amount || 0,
      thisMonth: monthPurchases._sum.amount || 0,
      transactionCount: totalCount,
    };
  }
}
