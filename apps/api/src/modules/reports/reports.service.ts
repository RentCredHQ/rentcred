import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ReviewReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Generate a report from a completed submission's verification data.
   */
  async generate(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        verificationChecklist: true,
        fieldVisits: { orderBy: { visitDate: 'desc' }, take: 1 },
        report: true,
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.report) {
      throw new BadRequestException('Report already exists for this submission');
    }

    // Compile report content from verification data
    const checklist = submission.verificationChecklist;
    const latestVisit = submission.fieldVisits[0];

    const content = {
      tenant: {
        name: submission.tenantName,
        email: submission.tenantEmail,
        phone: submission.tenantPhone,
      },
      property: {
        address: submission.propertyAddress,
        annualRent: submission.annualRent,
        monthlyRent: submission.monthlyRent,
        propertyType: submission.propertyType,
        bedrooms: submission.bedrooms,
        state: submission.state,
        lga: submission.lga,
        neighborhood: submission.neighborhood,
        landlordName: submission.landlordName,
        landlordPhone: submission.landlordPhone,
        propertyCondition: submission.propertyCondition,
        propertyImages: submission.propertyImages,
      },
      employment: {
        employer: submission.employerName,
        address: submission.employerAddress,
        income: submission.monthlyIncome,
      },
      verification: {
        identityVerified: checklist?.identityVerified || false,
        employmentVerified: checklist?.employmentVerified || false,
        referencesVerified: checklist?.referencesVerified || false,
        addressVerified: checklist?.addressVerified || false,
        criminalCheckDone: checklist?.criminalCheckDone || false,
        fieldVisitCompleted: checklist?.fieldVisitCompleted || false,
        completedAt: checklist?.completedAt,
      },
      fieldVisit: latestVisit
        ? {
            date: latestVisit.visitDate,
            gps: latestVisit.gpsLatitude
              ? { lat: latestVisit.gpsLatitude, lng: latestVisit.gpsLongitude }
              : null,
            summary: latestVisit.summary,
            photos: latestVisit.photos,
          }
        : null,
      generatedAt: new Date().toISOString(),
    };

    const report = await this.prisma.report.create({
      data: {
        submissionId,
        content,
        status: 'draft',
      },
    });

    await this.audit.log({
      userId,
      action: 'report_generated',
      entityType: 'report',
      entityId: report.id,
      metadata: { submissionId },
    });

    return report;
  }

  /**
   * List reports with pagination.
   */
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

    // Agents only see reports for their own submissions
    if (options.role === 'agent') {
      where.submission = { agentId: options.userId };
    }

    if (options.status) {
      where.status = options.status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
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
              agent: { select: { name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single report with authorization check.
   */
  async findOne(id: string, userId: string, role: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        submission: {
          select: {
            id: true,
            tenantName: true,
            tenantEmail: true,
            tenantPhone: true,
            propertyAddress: true,
            annualRent: true,
            monthlyRent: true,
            propertyType: true,
            bedrooms: true,
            state: true,
            lga: true,
            neighborhood: true,
            landlordName: true,
            landlordPhone: true,
            propertyCondition: true,
            propertyImages: true,
            agentId: true,
            status: true,
            agent: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!report) throw new NotFoundException('Report not found');

    if (role === 'agent' && report.submission.agentId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return report;
  }

  /**
   * Approve or reject a report (ops/admin).
   */
  async review(id: string, reviewerId: string, dto: ReviewReportDto) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { submission: { select: { agentId: true, tenantName: true } } },
    });

    if (!report) throw new NotFoundException('Report not found');

    if (!['approved', 'rejected'].includes(dto.status)) {
      throw new BadRequestException('Status must be approved or rejected');
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        approvedBy: reviewerId,
        approvedAt: dto.status === 'approved' ? new Date() : null,
      },
    });

    // If approved, mark submission as completed
    if (dto.status === 'approved') {
      await this.prisma.submission.update({
        where: { id: report.submissionId },
        data: { status: 'completed' },
      });
    }

    // Notify the agent
    await this.notifications.emit({
      userId: report.submission.agentId,
      type: 'report_ready',
      title:
        dto.status === 'approved'
          ? 'Report Approved'
          : 'Report Rejected',
      message:
        dto.status === 'approved'
          ? `The verification report for ${report.submission.tenantName} is ready to share.`
          : `The report for ${report.submission.tenantName} needs revision. ${dto.notes || ''}`,
      data: { reportId: id, status: dto.status },
    });

    await this.audit.log({
      userId: reviewerId,
      action: `report_${dto.status}`,
      entityType: 'report',
      entityId: id,
      metadata: { notes: dto.notes },
    });

    return updated;
  }

  /**
   * Generate a share token for public access.
   */
  async share(id: string, userId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { submission: { select: { agentId: true } } },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== 'approved') {
      throw new BadRequestException('Only approved reports can be shared');
    }

    // Only the agent who owns the submission can share
    if (report.submission.agentId !== userId) {
      throw new ForbiddenException('Only the submitting agent can share this report');
    }

    const shareToken = report.shareToken || randomUUID();

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        shareToken,
        sharedAt: report.sharedAt || new Date(),
      },
    });

    return {
      shareToken: updated.shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports/shared/${updated.shareToken}`,
    };
  }

  /**
   * Public endpoint — get a shared report by token (no auth).
   */
  async findByShareToken(token: string) {
    const report = await this.prisma.report.findUnique({
      where: { shareToken: token },
      include: {
        submission: {
          select: {
            tenantName: true,
            propertyAddress: true,
            annualRent: true,
            monthlyRent: true,
            propertyType: true,
            bedrooms: true,
            state: true,
            lga: true,
            neighborhood: true,
            propertyImages: true,
          },
        },
      },
    });

    if (!report) throw new NotFoundException('Report not found or link expired');
    if (report.status !== 'approved') throw new NotFoundException('Report not available');

    return {
      id: report.id,
      content: report.content,
      submission: report.submission,
      approvedAt: report.approvedAt,
      sharedAt: report.sharedAt,
    };
  }
}
