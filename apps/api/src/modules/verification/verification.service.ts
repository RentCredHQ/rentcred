import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async getChecklist(submissionId: string) {
    const checklist = await this.prisma.verificationChecklist.findUnique({
      where: { submissionId },
      include: {
        submission: {
          select: { id: true, tenantName: true, status: true, agentId: true },
        },
      },
    });

    if (!checklist) throw new NotFoundException('Checklist not found');

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

  async updateChecklist(submissionId: string, userId: string, dto: UpdateChecklistDto) {
    const checklist = await this.prisma.verificationChecklist.findUnique({
      where: { submissionId },
      include: { submission: { select: { agentId: true, tenantName: true } } },
    });

    if (!checklist) throw new NotFoundException('Checklist not found');

    const updateData: any = {};
    if (dto.identityVerified !== undefined) updateData.identityVerified = dto.identityVerified;
    if (dto.employmentVerified !== undefined) updateData.employmentVerified = dto.employmentVerified;
    if (dto.referencesVerified !== undefined) updateData.referencesVerified = dto.referencesVerified;
    if (dto.addressVerified !== undefined) updateData.addressVerified = dto.addressVerified;
    if (dto.criminalCheckDone !== undefined) updateData.criminalCheckDone = dto.criminalCheckDone;
    if (dto.fieldVisitCompleted !== undefined) updateData.fieldVisitCompleted = dto.fieldVisitCompleted;
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
