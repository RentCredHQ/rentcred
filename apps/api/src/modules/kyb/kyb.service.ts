import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ApplyKybDto, ReviewKybDto } from './dto/kyb.dto';

@Injectable()
export class KybService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async applyForKyb(userId: string, dto: ApplyKybDto) {
    const profile = await this.prisma.agentProfile.findUnique({
      where: { userId },
      include: { kybApplication: true },
    });

    if (!profile) throw new NotFoundException('Agent profile not found');

    if (profile.kybApplication) {
      throw new BadRequestException(
        'KYB application already exists. Current status: ' + profile.kybApplication.status,
      );
    }

    const application = await this.prisma.kybApplication.create({
      data: {
        agentProfileId: profile.id,
        companyName: dto.companyName,
        rcNumber: dto.rcNumber,
        cacDocument: dto.cacDocument,
        directorIdUrl: dto.directorIdUrl,
        utilityBillUrl: dto.utilityBillUrl,
        status: 'pending',
      },
    });

    // Update agent profile KYB status
    await this.prisma.agentProfile.update({
      where: { id: profile.id },
      data: { kybStatus: 'submitted', companyName: dto.companyName, rcNumber: dto.rcNumber },
    });

    // Audit
    await this.audit.log({
      userId,
      action: 'kyb_application_submitted',
      entityType: 'kyb_application',
      entityId: application.id,
    });

    return application;
  }

  async getApplications(
    userId: string,
    role: string,
    options?: { page?: number; limit?: number; status?: string },
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Agents only see their own application
    if (role === 'agent') {
      const profile = await this.prisma.agentProfile.findUnique({ where: { userId } });
      if (!profile) throw new NotFoundException('Agent profile not found');
      where.agentProfileId = profile.id;
    }

    if (options?.status) {
      where.status = options.status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.kybApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          agentProfile: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.kybApplication.count({ where }),
    ]);

    return {
      data: applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getApplication(id: string) {
    const app = await this.prisma.kybApplication.findUnique({
      where: { id },
      include: {
        agentProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!app) throw new NotFoundException('KYB application not found');
    return app;
  }

  async reviewApplication(id: string, reviewerId: string, dto: ReviewKybDto) {
    const app = await this.prisma.kybApplication.findUnique({
      where: { id },
      include: { agentProfile: true },
    });

    if (!app) throw new NotFoundException('KYB application not found');

    const validStatuses = ['under_review', 'approved', 'rejected'];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException('Invalid status. Must be: ' + validStatuses.join(', '));
    }

    const updated = await this.prisma.kybApplication.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedBy: reviewerId,
        reviewNotes: dto.reviewNotes,
      },
    });

    // Sync KYB status to agent profile
    await this.prisma.agentProfile.update({
      where: { id: app.agentProfileId },
      data: { kybStatus: dto.status },
    });

    // Notify the agent
    await this.notifications.emit({
      userId: app.agentProfile.userId,
      type: 'kyb_update',
      title: dto.status === 'approved' ? 'KYB Approved!' : `KYB ${dto.status.replace('_', ' ')}`,
      message:
        dto.status === 'approved'
          ? 'Your business verification has been approved. You can now submit tenant verification requests.'
          : dto.status === 'rejected'
            ? `Your KYB application was rejected. ${dto.reviewNotes || 'Please resubmit with correct documents.'}`
            : 'Your KYB application is now under review.',
      data: { applicationId: id, status: dto.status },
    });

    // Audit
    await this.audit.log({
      userId: reviewerId,
      action: `kyb_application_${dto.status}`,
      entityType: 'kyb_application',
      entityId: id,
      metadata: { reviewNotes: dto.reviewNotes },
    });

    return updated;
  }
}
