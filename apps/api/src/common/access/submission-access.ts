import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** The authenticated principal, as returned by JwtStrategy.validate(). */
export interface RequestUser {
  sub: string;
  role: string;
  email?: string;
}

/** The submission fields required to decide access. */
export interface SubmissionOwnership {
  id: string;
  agentId: string;
  tenantEmail: string;
}

/**
 * Decides whether a user may read a specific submission and everything hanging
 * off it (report, checklist, disputes).
 *
 * Every caller used to check only `role === 'agent'`, which meant any
 * authenticated tenant or field agent could read any submission by id and see
 * the tenant's income, employer and landlord's phone number. Access is:
 *
 *   ops / admin  — any submission
 *   agent        — only submissions they created
 *   tenant       — only the submission naming their email
 *   field_agent  — only submissions they hold a live assignment for
 *
 * Emails are compared lowercased because `tenantEmail` is typed by an agent and
 * the tenant's own address is whatever they registered with.
 */
export async function assertCanAccessSubmission(
  prisma: PrismaService,
  user: RequestUser,
  submission: SubmissionOwnership,
): Promise<void> {
  const { role, sub: userId, email } = user;

  if (role === 'ops' || role === 'admin') return;

  if (role === 'agent') {
    if (submission.agentId !== userId) throw new ForbiddenException('Access denied');
    return;
  }

  if (role === 'tenant') {
    const tenantEmail = submission.tenantEmail?.toLowerCase().trim();
    const userEmail = email?.toLowerCase().trim();
    if (!userEmail || !tenantEmail || tenantEmail !== userEmail) {
      throw new ForbiddenException('Access denied');
    }
    return;
  }

  if (role === 'field_agent') {
    const assignment = await prisma.fieldAssignment.findFirst({
      where: {
        submissionId: submission.id,
        fieldAgentId: userId,
        status: { in: ['assigned', 'in_progress', 'completed'] },
      },
      select: { id: true },
    });
    if (!assignment) throw new ForbiddenException('Access denied');
    return;
  }

  throw new ForbiddenException('Access denied');
}

/**
 * Stricter variant for writes: a field agent may only modify a submission they
 * are *currently* assigned to. A superseded or completed assignment grants read
 * access (they need to see their own past work) but not the right to keep
 * editing it.
 */
export async function assertCanModifyAsFieldAgent(
  prisma: PrismaService,
  userId: string,
  submissionId: string,
): Promise<void> {
  const assignment = await prisma.fieldAssignment.findFirst({
    where: {
      submissionId,
      fieldAgentId: userId,
      status: { in: ['assigned', 'in_progress'] },
    },
    select: { id: true },
  });
  if (!assignment) throw new ForbiddenException('Access denied');
}
