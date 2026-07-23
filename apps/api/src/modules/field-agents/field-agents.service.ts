import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { VerificationService } from '../verification/verification.service';
import { MailService } from '../mail/mail.service';
import {
  SubmitVisitDto,
  UpdateAssignmentStatusDto,
  CreateFieldAgentDto,
} from './dto/field-agent.dto';

const BCRYPT_ROUNDS = 12;

/** Random initial password, emailed to the agent and never returned by the API. */
function generateTempPassword(): string {
  // Guarantees one of each required character class alongside the random part.
  return `Rc${randomBytes(9).toString('base64url').replace(/[^a-zA-Z0-9]/g, 'x')}9!`;
}

@Injectable()
export class FieldAgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
    private readonly verification: VerificationService,
    private readonly mail: MailService,
  ) {}

  /**
   * List all field agents with their assignment counts.
   */
  async findAll(options?: { page?: number; limit?: number; search?: string }) {
    const safePage = Math.max(1, options?.page || 1);
    const safeLimit = Math.min(Math.max(1, options?.limit || 20), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = { role: 'field_agent' };

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [agents, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          isVerified: true,
          createdAt: true,
          assignments: {
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Enrich with stats
    const data = agents.map((agent) => ({
      ...agent,
      activeAssignments: agent.assignments.filter((a) => a.status === 'assigned' || a.status === 'in_progress').length,
      completedAssignments: agent.assignments.filter((a) => a.status === 'completed').length,
      totalAssignments: agent.assignments.length,
      assignments: undefined,
    }));

    return {
      data,
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  /**
   * Create a field agent account. Ops has had an "Add Field Agent" form since
   * before there was an endpoint behind it. The temporary password is emailed
   * rather than returned, so it never lands in a browser history or log.
   */
  async create(createdBy: string, dto: CreateFieldAgentDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('A user with that email already exists');

    const tempPassword = generateTempPassword();

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        phone: dto.phone,
        role: 'field_agent',
        passwordHash: await bcrypt.hash(tempPassword, BCRYPT_ROUNDS),
        // Ops vouches for the address by entering it, and field agents have no
        // self-service signup to verify through.
        isVerified: true,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
    });

    this.mail.sendFieldAgentWelcome(user.email, user.name, tempPassword);

    await this.audit.log({
      userId: createdBy,
      action: 'field_agent_created',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email },
    });

    return user;
  }

  /**
   * Suspend or reactivate a field agent. JwtStrategy re-reads isActive on every
   * request, so suspension takes effect immediately rather than when their
   * 7-day token happens to expire.
   */
  async setActive(id: string, actorId: string, isActive: boolean) {
    const agent = await this.prisma.user.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException('Field agent not found');
    if (agent.role !== 'field_agent') {
      throw new BadRequestException('This endpoint only manages field agents');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await this.audit.log({
      userId: actorId,
      action: isActive ? 'field_agent_reactivated' : 'field_agent_suspended',
      entityType: 'user',
      entityId: id,
    });

    return updated;
  }

  /**
   * Get a single field agent with stats and recent assignments.
   */
  async findOne(id: string) {
    const agent = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        assignments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            submission: {
              select: { id: true, tenantName: true, propertyAddress: true, status: true },
            },
          },
        },
      },
    });

    if (!agent) throw new NotFoundException('Field agent not found');

    const [active, completed, total] = await Promise.all([
      this.prisma.fieldAssignment.count({
        where: { fieldAgentId: id, status: { in: ['assigned', 'in_progress'] } },
      }),
      this.prisma.fieldAssignment.count({ where: { fieldAgentId: id, status: 'completed' } }),
      this.prisma.fieldAssignment.count({ where: { fieldAgentId: id } }),
    ]);

    return {
      ...agent,
      stats: { activeAssignments: active, completedAssignments: completed, totalAssignments: total },
      recentAssignments: agent.assignments,
      assignments: undefined,
    };
  }

  /**
   * Get assignments for a specific field agent.
   */
  async getMyAssignments(
    fieldAgentId: string,
    options?: { page?: number; limit?: number; status?: string },
  ) {
    const safePage = Math.max(1, options?.page || 1);
    const safeLimit = Math.min(Math.max(1, options?.limit || 20), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = { fieldAgentId };
    if (options?.status) where.status = options.status;

    const [assignments, total] = await Promise.all([
      this.prisma.fieldAssignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          submission: {
            select: {
              id: true,
              tenantName: true,
              tenantPhone: true,
              propertyAddress: true,
              propertyType: true,
              state: true,
              neighborhood: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.fieldAssignment.count({ where }),
    ]);

    return {
      data: assignments,
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  /**
   * Update assignment status.
   */
  async updateAssignmentStatus(
    assignmentId: string,
    fieldAgentId: string,
    dto: UpdateAssignmentStatusDto,
  ) {
    const assignment = await this.prisma.fieldAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.fieldAgentId !== fieldAgentId) {
      throw new ForbiddenException('Not your assignment');
    }

    const updateData: any = { status: dto.status };
    if (dto.status === 'completed') {
      updateData.completedAt = new Date();
    }

    return this.prisma.fieldAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });
  }

  /**
   * Submit a field visit report.
   */
  async submitVisitReport(fieldAgentId: string, dto: SubmitVisitDto) {
    // Must hold a live assignment — a superseded one means this case was
    // reassigned to someone else and is no longer theirs to report on.
    const assignment = await this.prisma.fieldAssignment.findFirst({
      where: {
        submissionId: dto.submissionId,
        fieldAgentId,
        status: { in: ['assigned', 'in_progress'] },
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this submission');
    }

    const visit = await this.prisma.fieldVisit.create({
      data: {
        submissionId: dto.submissionId,
        fieldAgentId,
        visitDate: new Date(dto.visitDate),
        gpsLatitude: dto.gpsLatitude,
        gpsLongitude: dto.gpsLongitude,
        photos: dto.photos || [],
        notes: dto.notes,
        checklistItems: dto.checklistItems ?? undefined,
        summary: dto.summary,
      },
    });

    // Mark field visit as completed on the verification checklist
    await this.prisma.verificationChecklist.updateMany({
      where: { submissionId: dto.submissionId },
      data: { fieldVisitCompleted: true },
    });

    // This may have been the last outstanding check, in which case the
    // checklist needs finalizing and the case needs to advance.
    await this.verification.finalizeIfComplete(dto.submissionId);

    // Complete the assignment
    await this.prisma.fieldAssignment.update({
      where: { id: assignment.id },
      data: { status: 'completed', completedAt: new Date() },
    });

    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      select: { agentId: true, tenantName: true, assignedOpsId: true },
    });

    // Notify the submitting agent, and the ops owner when the case has one —
    // this previously said it notified ops but only ever told the agent.
    const recipients = new Set<string>();
    if (submission?.agentId) recipients.add(submission.agentId);
    if (submission?.assignedOpsId) recipients.add(submission.assignedOpsId);

    for (const userId of recipients) {
      await this.notifications.emit({
        userId,
        type: 'field_visit_completed',
        title: 'Field Visit Completed',
        message: `Field visit for ${submission!.tenantName} has been completed.`,
        data: { submissionId: dto.submissionId, visitId: visit.id },
      });
    }

    await this.audit.log({
      userId: fieldAgentId,
      action: 'field_visit_submitted',
      entityType: 'field_visit',
      entityId: visit.id,
      metadata: { submissionId: dto.submissionId },
    });

    return visit;
  }

  /**
   * Get field agent dashboard stats.
   */
  async getDashboardStats(fieldAgentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeAssignments, completedVisits, totalAssignments, pending, todaysVisits] =
      await Promise.all([
        this.prisma.fieldAssignment.count({
          where: { fieldAgentId, status: { in: ['assigned', 'in_progress'] } },
        }),
        this.prisma.fieldAssignment.count({
          where: { fieldAgentId, status: 'completed' },
        }),
        this.prisma.fieldAssignment.count({ where: { fieldAgentId } }),
        this.prisma.fieldAssignment.count({
          where: { fieldAgentId, status: 'assigned' },
        }),
        this.prisma.fieldVisit.count({
          where: { fieldAgentId, visitDate: { gte: today } },
        }),
      ]);

    return {
      todaysVisits,
      activeAssignments,
      completedVisits,
      totalAssignments,
      pending,
    };
  }
}
