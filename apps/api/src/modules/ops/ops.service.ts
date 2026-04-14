import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OpsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalAgents,
      totalTenants,
      totalFieldAgents,
      totalSubmissions,
      pendingSubmissions,
      completedSubmissions,
      totalReports,
      approvedReports,
      openDisputes,
      pendingKyb,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'agent' } }),
      this.prisma.user.count({ where: { role: 'tenant' } }),
      this.prisma.user.count({ where: { role: 'field_agent' } }),
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { status: 'pending' } }),
      this.prisma.submission.count({ where: { status: 'completed' } }),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'approved' } }),
      this.prisma.dispute.count({ where: { status: 'open' } }),
      this.prisma.kybApplication.count({ where: { status: 'pending' } }),
      this.prisma.transaction.aggregate({
        where: { type: 'purchase', status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      users: { total: totalUsers, agents: totalAgents, tenants: totalTenants, fieldAgents: totalFieldAgents },
      submissions: { total: totalSubmissions, pending: pendingSubmissions, completed: completedSubmissions },
      reports: { total: totalReports, approved: approvedReports },
      disputes: { open: openDisputes },
      kyb: { pending: pendingKyb },
      revenue: { totalCredits: totalRevenue._sum.amount || 0 },
    };
  }

  async getRecentActivity(limit = 10) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
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
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

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
        take: limit,
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
