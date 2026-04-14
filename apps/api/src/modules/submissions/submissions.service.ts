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
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId: agentId } });
    if (!agent || agent.creditBalance < 1) {
      throw new ForbiddenException('Insufficient credits. Please purchase a credit bundle.');
    }

    const [submission] = await this.prisma.$transaction([
      this.prisma.submission.create({
        data: {
          agentId,
          tenantName: dto.tenantName,
          tenantEmail: dto.tenantEmail,
          tenantPhone: dto.tenantPhone,
          propertyAddress: dto.propertyAddress,
          annualRent: dto.annualRent,
          monthlyRent: dto.monthlyRent ?? dto.annualRent / 12,
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
      }),
      this.prisma.agentProfile.update({
        where: { userId: agentId },
        data: { creditBalance: { decrement: 1 } },
      }),
      this.prisma.transaction.create({
        data: {
          agentId,
          type: 'deduction',
          amount: 1,
          description: `Submission for ${dto.tenantName}`,
        },
      }),
    ]);

    // Create verification checklist
    await this.prisma.verificationChecklist.create({
      data: { submissionId: submission.id },
    });

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
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

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
        take: limit,
        include: {
          agent: { select: { id: true, name: true, email: true } },
          report: { select: { id: true, status: true } },
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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

    return submission;
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
      metadata: { fieldAgentId: dto.fieldAgentId },
    });

    return assignment;
  }
}
