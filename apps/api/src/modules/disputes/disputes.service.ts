import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      select: { id: true, agentId: true, tenantName: true, propertyAddress: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    const dispute = await this.prisma.dispute.create({
      data: {
        submissionId: dto.submissionId,
        raisedById: userId,
        reason: dto.reason,
        description: dto.description,
        status: 'open',
      },
    });

    // Notify the raiser (confirmation)
    await this.notifications.emit({
      userId,
      type: 'dispute_update',
      title: 'Dispute Filed',
      message: `Your dispute for ${submission.tenantName} at ${submission.propertyAddress} has been submitted.`,
      data: { disputeId: dispute.id, submissionId: dto.submissionId },
    });

    // Notify the submission's agent (if dispute was filed by someone else)
    if (submission.agentId !== userId) {
      await this.notifications.emit({
        userId: submission.agentId,
        type: 'dispute_update',
        title: 'Dispute Filed on Your Submission',
        message: `A dispute has been raised for ${submission.tenantName} at ${submission.propertyAddress}: ${dto.reason}`,
        data: { disputeId: dispute.id, submissionId: dto.submissionId },
      });
    }

    // Notify all ops users
    const opsUsers = await this.prisma.user.findMany({
      where: { role: { in: ['ops', 'admin'] } },
      select: { id: true },
    });
    for (const ops of opsUsers) {
      await this.notifications.emit({
        userId: ops.id,
        type: 'dispute_update',
        title: 'New Dispute Requires Attention',
        message: `${dto.reason} — ${submission.tenantName} at ${submission.propertyAddress}`,
        data: { disputeId: dispute.id, submissionId: dto.submissionId },
      });
    }

    await this.audit.log({
      userId,
      action: 'dispute_created',
      entityType: 'dispute',
      entityId: dispute.id,
      metadata: { submissionId: dto.submissionId, reason: dto.reason },
    });

    return dispute;
  }

  async findAll(options: {
    userId: string;
    role: string;
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-ops users only see disputes they raised
    if (!['ops', 'admin'].includes(options.role)) {
      where.raisedById = options.userId;
    }

    if (options.status && options.status !== 'all') {
      where.status = options.status;
    }

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          submission: {
            select: {
              id: true,
              tenantName: true,
              propertyAddress: true,
              agentId: true,
              agent: { select: { name: true } },
            },
          },
          raisedBy: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      data: disputes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        submission: {
          select: {
            id: true,
            tenantName: true,
            tenantEmail: true,
            propertyAddress: true,
            agentId: true,
            agent: { select: { name: true, email: true } },
          },
        },
        raisedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    // Auth check: only raiser, submission agent, ops, or admin can view
    const isRaiser = dispute.raisedById === userId;
    const isAgent = dispute.submission.agentId === userId;
    const isOpsOrAdmin = ['ops', 'admin'].includes(role);

    if (!isRaiser && !isAgent && !isOpsOrAdmin) {
      throw new ForbiddenException('Access denied');
    }

    return dispute;
  }

  async resolve(id: string, userId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        submission: {
          select: { agentId: true, tenantName: true, propertyAddress: true, tenantEmail: true },
        },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (!['under_review', 'resolved', 'closed'].includes(dto.status)) {
      throw new BadRequestException('Invalid status');
    }

    const updateData: any = { status: dto.status };
    if (dto.resolution) updateData.resolution = dto.resolution;
    if (['resolved', 'closed'].includes(dto.status)) {
      updateData.resolvedBy = userId;
      updateData.resolvedAt = new Date();
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: updateData,
    });

    const statusLabel = dto.status.replace('_', ' ');

    // Notify the person who raised the dispute
    await this.notifications.emit({
      userId: dispute.raisedById,
      type: 'dispute_update',
      title: `Dispute ${statusLabel}`,
      message: dto.resolution || `Your dispute for ${dispute.submission.tenantName} has been ${statusLabel}.`,
      data: { disputeId: id, status: dto.status },
    });

    // Notify the submission's agent
    if (dispute.submission.agentId !== dispute.raisedById) {
      await this.notifications.emit({
        userId: dispute.submission.agentId,
        type: 'dispute_update',
        title: `Dispute ${statusLabel}`,
        message: `A dispute on ${dispute.submission.tenantName} at ${dispute.submission.propertyAddress} has been ${statusLabel}.`,
        data: { disputeId: id, status: dto.status },
      });
    }

    // Notify the tenant if their email matches a user account
    const tenantUser = await this.prisma.user.findUnique({
      where: { email: dispute.submission.tenantEmail },
    });
    if (tenantUser && tenantUser.id !== dispute.raisedById) {
      await this.notifications.emit({
        userId: tenantUser.id,
        type: 'dispute_update',
        title: `Dispute ${statusLabel}`,
        message: `A dispute regarding your verification has been ${statusLabel}.`,
        data: { disputeId: id, status: dto.status },
      });
    }

    await this.audit.log({
      userId,
      action: `dispute_${dto.status}`,
      entityType: 'dispute',
      entityId: id,
      metadata: { resolution: dto.resolution },
    });

    return updated;
  }
}
