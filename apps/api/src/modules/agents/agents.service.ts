import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
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
    if (!user) throw new NotFoundException('User not found');
    const { agentProfile, ...rest } = user;
    return { ...rest, ...(agentProfile || {}) };
  }

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
      const profile = await this.prisma.agentProfile.findUnique({
        where: { userId },
        include: { kybApplication: { select: { id: true, status: true } } },
      });
      if (!profile) throw new NotFoundException('Agent profile not found');

      const kyb = profile.kybApplication;

      // companyName and rcNumber are stored on both the profile and the KYB
      // application. Once ops has approved or is reviewing an application, the
      // company it names is the one that was checked, so it must not drift.
      if (
        data.companyName &&
        data.companyName !== profile.companyName &&
        kyb &&
        ['approved', 'under_review'].includes(kyb.status)
      ) {
        throw new BadRequestException(
          'Company name cannot be changed while KYB is under review or approved. Contact support.',
        );
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.agentProfile.update({
          where: { userId },
          data: {
            ...(data.companyName && { companyName: data.companyName }),
            ...(data.companyAddress && { companyAddress: data.companyAddress }),
          },
        });

        // Keep the pending application's copy in step with the profile.
        if (data.companyName && kyb && !['approved', 'under_review'].includes(kyb.status)) {
          await tx.kybApplication.update({
            where: { id: kyb.id },
            data: { companyName: data.companyName },
          });
        }
      });
    }

    // Return full profile (flattened same as getProfile)
    const result = await this.prisma.user.findUnique({
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
    if (!result) throw new NotFoundException('User not found');
    const { agentProfile, ...rest } = result;
    return { ...rest, ...(agentProfile || {}) };
  }
}
