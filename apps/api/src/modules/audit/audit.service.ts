import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface LogEventParams {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an audit event. Called by other modules on write operations.
   */
  async log(params: LogEventParams) {
    const entry = await this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress,
      },
    });

    this.logger.log(`Audit: ${params.action} on ${params.entityType}/${params.entityId} by ${params.userId}`);

    return entry;
  }

  /**
   * List audit logs with pagination and filters.
   */
  async findAll(filters: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    from?: string;
    to?: string;
  }) {
    const safePage = Math.max(1, filters.page || 1);
    const safeLimit = Math.min(Math.max(1, filters.limit || 50), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    const [entries, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: entries,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}
