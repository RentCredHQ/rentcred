import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import {
  assertCanAccessSubmission,
  assertCanModifyAsFieldAgent,
  RequestUser,
} from '../../common/access/submission-access';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async getChecklist(submissionId: string, user?: RequestUser) {
    const checklist = await this.prisma.verificationChecklist.findUnique({
      where: { submissionId },
      include: {
        submission: {
          select: { id: true, tenantName: true, status: true, agentId: true, tenantEmail: true },
        },
      },
    });

    if (!checklist) throw new NotFoundException('Checklist not found');

    if (user) {
      await assertCanAccessSubmission(this.prisma, user, checklist.submission);
    }

    const items = [
      checklist.identityVerified,
      checklist.employmentVerified,
      checklist.referencesVerified,
      checklist.addressVerified,
      checklist.criminalCheckDone,
      checklist.fieldVisitCompleted,
    ];
    const completedCount = items.filter(Boolean).length;

    return {
      ...checklist,
      completedCount,
      totalItems: 6,
      completionPercent: Math.round((completedCount / 6) * 100),
    };
  }

  async updateChecklist(
    submissionId: string,
    userId: string,
    dto: UpdateChecklistDto,
    user?: RequestUser,
  ) {
    const checklist = await this.prisma.verificationChecklist.findUnique({
      where: { submissionId },
      include: {
        submission: { select: { id: true, agentId: true, tenantName: true, tenantEmail: true } },
      },
    });

    if (!checklist) throw new NotFoundException('Checklist not found');

    // Ops and admin own this workflow. A field agent may only touch a checklist
    // for a case they are actively assigned to; previously any field agent could
    // edit any case's verification results.
    if (user) {
      if (user.role === 'field_agent') {
        await assertCanModifyAsFieldAgent(this.prisma, user.sub, submissionId);
      } else if (user.role !== 'ops' && user.role !== 'admin') {
        throw new ForbiddenException('Access denied');
      }
    }

    if (checklist.completedAt) {
      throw new BadRequestException('Checklist has been finalized and cannot be modified');
    }

    // Field Visit can only be marked by the field agent submitting a visit report
    if (dto.fieldVisitCompleted !== undefined) {
      throw new BadRequestException('Field Visit is automatically verified when the field agent submits their visit report');
    }

    const updateData: any = {};
    if (dto.identityVerified !== undefined) updateData.identityVerified = dto.identityVerified;
    if (dto.employmentVerified !== undefined) updateData.employmentVerified = dto.employmentVerified;
    if (dto.referencesVerified !== undefined) updateData.referencesVerified = dto.referencesVerified;
    if (dto.addressVerified !== undefined) updateData.addressVerified = dto.addressVerified;
    if (dto.criminalCheckDone !== undefined) updateData.criminalCheckDone = dto.criminalCheckDone;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.verificationChecklist.update({
      where: { submissionId },
      data: updateData,
    });

    // Check if all items are now complete
    const allComplete =
      updated.identityVerified &&
      updated.employmentVerified &&
      updated.referencesVerified &&
      updated.addressVerified &&
      updated.criminalCheckDone &&
      updated.fieldVisitCompleted;

    if (allComplete && !checklist.completedAt) {
      // Mark checklist as completed
      await this.prisma.verificationChecklist.update({
        where: { submissionId },
        data: { completedAt: new Date() },
      });

      // Move submission to report_building
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'report_building' },
      });

      // Notify the agent
      await this.notifications.emit({
        userId: checklist.submission.agentId,
        type: 'submission_update',
        title: 'Verification Complete',
        message: `All verification checks for ${checklist.submission.tenantName} are complete. Report is being built.`,
        data: { submissionId },
      });
    }

    await this.audit.log({
      userId,
      action: 'checklist_updated',
      entityType: 'verification_checklist',
      entityId: checklist.id,
      metadata: updateData,
    });

    // Return enriched checklist
    return this.getChecklist(submissionId);
  }
}
