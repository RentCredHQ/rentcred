import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OpsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalCases,
      pendingVerifications,
      fieldVisitsToday,
      reportsReady,
      inProgress,
      completedThisWeek,
    ] = await Promise.all([
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { status: 'pending' } }),
      this.prisma.fieldVisit.count({ where: { createdAt: { gte: today } } }),
      this.prisma.report.count({ where: { status: 'approved' } }),
      this.prisma.submission.count({ where: { status: 'in_progress' } }),
      this.prisma.submission.count({
        where: { status: 'completed', updatedAt: { gte: sevenDaysAgo } },
      }),
    ]);

    return {
      totalCases,
      pendingVerifications,
      fieldVisitsToday,
      reportsReady,
      inProgress,
      completedThisWeek,
    };
  }

  async getRecentCases(limit = 10) {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    return this.prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      select: {
        id: true,
        tenantName: true,
        propertyAddress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        agent: { select: { name: true } },
      },
    });
  }

  async getRecentActivity(limit = 10) {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async getUsers(options?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const safePage = Math.max(1, options?.page || 1);
    const safeLimit = Math.min(Math.max(1, options?.limit || 20), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};
    if (options?.role) where.role = options.role;
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isVerified: true,
          createdAt: true,
          agentProfile: {
            select: { kybStatus: true, creditBalance: true, companyName: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }
}
