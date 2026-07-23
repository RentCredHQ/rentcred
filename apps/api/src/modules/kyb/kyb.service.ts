import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { UploadService } from '../upload/upload.service';
import { ApplyKybDto, ReviewKybDto } from './dto/kyb.dto';

@Injectable()
export class KybService {
  private readonly logger = new Logger(KybService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
    private readonly upload: UploadService,
  ) {}

  async applyForKyb(userId: string, dto: ApplyKybDto) {
    const profile = await this.prisma.agentProfile.findUnique({
      where: { userId },
      include: { kybApplication: true },
    });

    if (!profile) throw new NotFoundException('Agent profile not found');

    const existing = profile.kybApplication;

    // A rejected application can be resubmitted. The settings page has always
    // offered "Submit New Application", but the row is unique per agent so this
    // threw unconditionally — leaving a rejected agent permanently unable to
    // reapply without direct database access.
    if (existing && existing.status !== 'rejected') {
      throw new BadRequestException(
        'KYB application already exists. Current status: ' + existing.status,
      );
    }

    const data = {
      companyName: dto.companyName,
      rcNumber: dto.rcNumber,
      cacDocument: dto.cacDocumentUrl,
      directorIdUrl: dto.directorIdUrl,
      utilityBillUrl: dto.utilityBillUrl,
      status: 'pending',
    };

    const application = existing
      ? await this.prisma.kybApplication.update({
          where: { id: existing.id },
          // Clear the previous decision so the case reads as fresh for ops.
          data: { ...data, reviewNotes: null, reviewedBy: null },
        })
      : await this.prisma.kybApplication.create({
          data: { agentProfileId: profile.id, ...data },
        });

    // Update agent profile KYB status
    await this.prisma.agentProfile.update({
      where: { id: profile.id },
      data: {
        kybStatus: 'submitted',
        companyName: dto.companyName,
        rcNumber: dto.rcNumber,
        companyAddress: dto.companyAddress,
      },
    });

    // Audit
    await this.audit.log({
      userId,
      action: existing ? 'kyb_application_resubmitted' : 'kyb_application_submitted',
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
    const safePage = Math.max(1, options?.page || 1);
    const safeLimit = Math.min(Math.max(1, options?.limit || 20), 100);
    const skip = (safePage - 1) * safeLimit;

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
        take: safeLimit,
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
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async getApplication(id: string, userId?: string, role?: string) {
    const app = await this.prisma.kybApplication.findUnique({
      where: { id },
      include: {
        agentProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!app) throw new NotFoundException('KYB application not found');

    // The list endpoint scopes agents to their own application but this one
    // never did, so any agent holding another agent's application id could read
    // their CAC certificate, director ID and utility bill.
    if (role === 'agent' && app.agentProfile.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const [cacDocument, directorIdUrl, utilityBillUrl] = await Promise.all([
      this.resolveDocumentUrl(app.cacDocument),
      this.resolveDocumentUrl(app.directorIdUrl),
      this.resolveDocumentUrl(app.utilityBillUrl),
    ]);

    return { ...app, cacDocument, directorIdUrl, utilityBillUrl };
  }

  /**
   * KYB documents live in a private folder, so they are handed out as
   * short-lived presigned links rather than the permanent public bucket URLs
   * these used to resolve to. Values may be stored as a bare key or as a legacy
   * full URL, so normalize before signing.
   */
  private async resolveDocumentUrl(value: string | null | undefined): Promise<string | null> {
    if (!value) return null;
    const key = this.upload.toObjectKey(value);
    try {
      return await this.upload.getPresignedDownloadUrl(key);
    } catch (e) {
      this.logger.warn(`Could not sign KYB document ${key}: ${(e as Error).message}`);
      return null;
    }
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
