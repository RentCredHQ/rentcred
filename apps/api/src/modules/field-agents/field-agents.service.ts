import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { SubmitVisitDto, UpdateAssignmentStatusDto } from './dto/field-agent.dto';

@Injectable()
export class FieldAgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  /**
   * List all field agents with their assignment counts.
   */
  async findAll(options?: { page?: number; limit?: number; search?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

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
        take: limit,
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
      activeAssignments: agent.assignments.filter((a) => a.status !== 'completed').length,
      completedAssignments: agent.assignments.filter((a) => a.status === 'completed').length,
      totalAssignments: agent.assignments.length,
      assignments: undefined,
    }));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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

    if (!agent || !agent) throw new NotFoundException('Field agent not found');

    const [active, completed, total] = await Promise.all([
      this.prisma.fieldAssignment.count({ where: { fieldAgentId: id, status: { not: 'completed' } } }),
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
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { fieldAgentId };
    if (options?.status) where.status = options.status;

    const [assignments, total] = await Promise.all([
      this.prisma.fieldAssignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          submission: {
            select: {
              id: true,
              tenantName: true,
              tenantPhone: true,
              propertyAddress: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.fieldAssignment.count({ where }),
    ]);

    return {
      data: assignments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
    // Verify the field agent is assigned to this submission
    const assignment = await this.prisma.fieldAssignment.findFirst({
      where: { submissionId: dto.submissionId, fieldAgentId },
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

    // Complete the assignment
    await this.prisma.fieldAssignment.update({
      where: { id: assignment.id },
      data: { status: 'completed', completedAt: new Date() },
    });

    // Notify ops about the completed visit
    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      select: { agentId: true, tenantName: true, assignedOpsId: true },
    });

    if (submission?.agentId) {
      await this.notifications.emit({
        userId: submission.agentId,
        type: 'field_visit_completed',
        title: 'Field Visit Completed',
        message: `Field visit for ${submission.tenantName} has been completed.`,
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
    const [activeAssignments, completedVisits, totalAssignments] = await Promise.all([
      this.prisma.fieldAssignment.count({
        where: { fieldAgentId, status: { not: 'completed' } },
      }),
      this.prisma.fieldVisit.count({ where: { fieldAgentId } }),
      this.prisma.fieldAssignment.count({ where: { fieldAgentId } }),
    ]);

    return { activeAssignments, completedVisits, totalAssignments };
  }
}
