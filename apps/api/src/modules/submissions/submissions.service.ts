import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionStatusDto, AssignFieldAgentDto } from './dto/update-submission.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'rejected'],
  in_progress: ['field_visit', 'report_building', 'rejected'],
  field_visit: ['report_building', 'rejected'],
  report_building: ['completed', 'rejected'],
  completed: [],
  rejected: ['pending'],
};

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private audit: AuditService,
  ) {}

  async create(agentId: string, dto: CreateSubmissionDto) {
    // Use an interactive transaction with SELECT FOR UPDATE to prevent
    // race conditions where two concurrent requests could overdraw credits.
    const submission = await this.prisma.$transaction(async (tx) => {
      // Lock the agent profile row to prevent concurrent credit deduction
      const [agent] = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM agent_profiles WHERE user_id = $1 FOR UPDATE`,
        agentId,
      );

      if (!agent || agent.credit_balance < 1) {
        throw new ForbiddenException('Insufficient credits. Please purchase a credit bundle.');
      }

      if (agent.kyb_status !== 'approved') {
        throw new ForbiddenException('KYB verification must be approved before submitting.');
      }

      if (!dto.consentObtained) {
        throw new BadRequestException('Tenant consent is required before submitting.');
      }

      const created = await tx.submission.create({
        data: {
          agentId,
          tenantName: dto.tenantName,
          tenantEmail: dto.tenantEmail,
          tenantPhone: dto.tenantPhone,
          propertyAddress: dto.propertyAddress,
          annualRent: dto.annualRent ?? 0,
          monthlyRent: dto.monthlyRent ?? (dto.annualRent ?? 0) / 12,
          propertyType: dto.propertyType,
          bedrooms: dto.bedrooms,
          state: dto.state,
          lga: dto.lga,
          neighborhood: dto.neighborhood,
          landlordName: dto.landlordName,
          landlordPhone: dto.landlordPhone,
          propertyCondition: dto.propertyCondition,
          propertyImages: dto.propertyImages ?? [],
          employerName: dto.employerName,
          employerAddress: dto.employerAddress,
          monthlyIncome: dto.monthlyIncome,
          previousAddress: dto.previousAddress,
          reasonForMoving: dto.reasonForMoving,
          notes: dto.notes,
          consentObtained: dto.consentObtained,
          status: 'pending',
        },
      });

      await tx.agentProfile.update({
        where: { userId: agentId },
        data: { creditBalance: { decrement: 1 } },
      });

      await tx.transaction.create({
        data: {
          agentId,
          type: 'deduction',
          amount: 1,
          description: `Submission for ${dto.tenantName}`,
        },
      });

      // Create verification checklist
      await tx.verificationChecklist.create({
        data: { submissionId: created.id },
      });

      return created;
    });

    // Audit log and notifications run AFTER the transaction commits
    await this.audit.log({
      userId: agentId,
      action: 'submission_created',
      entityType: 'submission',
      entityId: submission.id,
    });

    return submission;
  }

  async findAll(options: {
    userId: string;
    role: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const safePage = Math.max(1, options.page || 1);
    const safeLimit = Math.min(Math.max(1, options.limit || 20), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

    if (options.role === 'agent') {
      where.agentId = options.userId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { tenantName: { contains: options.search, mode: 'insensitive' } },
        { tenantEmail: { contains: options.search, mode: 'insensitive' } },
        { propertyAddress: { contains: options.search, mode: 'insensitive' } },
        { neighborhood: { contains: options.search, mode: 'insensitive' } },
        { state: { contains: options.search, mode: 'insensitive' } },
        { id: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          agent: { select: { id: true, name: true, email: true } },
          report: { select: { id: true, status: true } },
          fieldAssignments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              fieldAgent: { select: { id: true, name: true } },
            },
          },
          verificationChecklist: {
            select: {
              identityVerified: true,
              employmentVerified: true,
              referencesVerified: true,
              addressVerified: true,
              criminalCheckDone: true,
              fieldVisitCompleted: true,
            },
          },
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      data: submissions,
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async findById(id: string, userId: string, role: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        verificationChecklist: true,
        fieldAssignments: {
          include: {
            fieldAgent: { select: { id: true, name: true, phone: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        fieldVisits: { orderBy: { visitDate: 'desc' } },
        report: true,
        disputes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    if (role === 'agent' && submission.agentId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...submission,
      propertyImages: (submission.propertyImages || []).map(img => this.resolveUrl(img as string)).filter(Boolean),
    };
  }

  private resolveUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    if (publicBase) return `${publicBase}/${value}`;
    return value;
  }

  async updateStatus(id: string, userId: string, dto: UpdateSubmissionStatusDto) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException('Submission not found');

    const allowed = VALID_TRANSITIONS[submission.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${submission.status}' to '${dto.status}'. Allowed: ${(allowed || []).join(', ') || 'none'}`,
      );
    }

    const updated = await this.prisma.submission.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.notifications.emit({
      userId: submission.agentId,
      type: 'submission_update',
      title: `Submission ${dto.status.replace('_', ' ')}`,
      message: `Verification for ${submission.tenantName} is now ${dto.status.replace('_', ' ')}.`,
      data: { submissionId: id, status: dto.status },
    });

    await this.audit.log({
      userId,
      action: `submission_status_${dto.status}`,
      entityType: 'submission',
      entityId: id,
      metadata: { from: submission.status, to: dto.status, notes: dto.notes },
    });

    return updated;
  }

  async assignFieldAgent(submissionId: string, userId: string, dto: AssignFieldAgentDto) {
    const submission = await this.prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException('Submission not found');

    const fieldAgent = await this.prisma.user.findUnique({
      where: { id: dto.fieldAgentId },
    });
    if (!fieldAgent || fieldAgent.role !== 'field_agent') {
      throw new BadRequestException('Invalid field agent');
    }

    const assignment = await this.prisma.fieldAssignment.create({
      data: {
        submissionId,
        fieldAgentId: dto.fieldAgentId,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        status: 'assigned',
      },
    });

    if (submission.status === 'in_progress') {
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'field_visit' },
      });
    }

    await this.notifications.emit({
      userId: dto.fieldAgentId,
      type: 'submission_update',
      title: 'New Assignment',
      message: `You've been assigned to verify ${submission.tenantName} at ${submission.propertyAddress}.`,
      data: { submissionId, assignmentId: assignment.id },
    });

    await this.audit.log({
      userId,
      action: 'field_agent_assigned',
      entityType: 'submission',
      entityId: submissionId,
      metadata: { fieldAgentId: dto.fieldAgentId, ...(dto.reason ? { reason: dto.reason } : {}) },
    });

    return assignment;
  }
}
