import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const profile = await this.prisma.agentProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Agent profile not found');

    const [
      totalSubmissions,
      pendingSubmissions,
      completedSubmissions,
      reportsReady,
      totalSpent,
    ] = await Promise.all([
      this.prisma.submission.count({ where: { agentId: userId } }),
      this.prisma.submission.count({ where: { agentId: userId, status: 'pending' } }),
      this.prisma.submission.count({ where: { agentId: userId, status: 'completed' } }),
      this.prisma.report.count({
        where: { submission: { agentId: userId }, status: 'approved' },
      }),
      this.prisma.transaction.aggregate({
        where: { agentId: userId, type: 'deduction', status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      creditBalance: profile.creditBalance,
      kybStatus: profile.kybStatus,
      totalSubmissions,
      pendingSubmissions,
      completedSubmissions,
      reportsReady,
      totalCreditsUsed: totalSpent._sum.amount || 0,
    };
  }

  async getRecentSubmissions(userId: string, limit = 5) {
    return this.prisma.submission.findMany({
      where: { agentId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        tenantName: true,
        propertyAddress: true,
        status: true,
        createdAt: true,
        report: { select: { id: true, status: true } },
      },
    });
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { agentId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { agentId: userId } }),
    ]);

    return {
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; companyName?: string; companyAddress?: string },
  ) {
    // Update user fields
    if (data.name || data.phone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.phone && { phone: data.phone }),
        },
      });
    }

    // Update agent profile fields
    if (data.companyName || data.companyAddress) {
      await this.prisma.agentProfile.update({
        where: { userId },
        data: {
          ...(data.companyName && { companyName: data.companyName }),
          ...(data.companyAddress && { companyAddress: data.companyAddress }),
        },
      });
    }

    // Return full profile
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        agentProfile: {
          select: {
            companyName: true,
            companyAddress: true,
            rcNumber: true,
            kybStatus: true,
            creditBalance: true,
          },
        },
      },
    });
  }
}
