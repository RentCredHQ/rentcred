import { ForbiddenException } from '@nestjs/common';
import {
  assertCanAccessSubmission,
  assertCanModifyAsFieldAgent,
} from './submission-access';

/**
 * These cover the IDOR fix: every one of these checks previously only ran for
 * role === 'agent', so any authenticated tenant or field agent could read any
 * submission by id.
 */
describe('submission access control', () => {
  const submission = {
    id: 'sub-1',
    agentId: 'agent-1',
    tenantEmail: 'tenant@example.com',
  };

  let prisma: any;

  beforeEach(() => {
    prisma = { fieldAssignment: { findFirst: jest.fn() } };
  });

  describe('assertCanAccessSubmission', () => {
    it.each(['ops', 'admin'])('allows %s to read any submission', async (role) => {
      await expect(
        assertCanAccessSubmission(prisma, { sub: 'x', role }, submission),
      ).resolves.toBeUndefined();
    });

    it('allows the owning agent', async () => {
      await expect(
        assertCanAccessSubmission(prisma, { sub: 'agent-1', role: 'agent' }, submission),
      ).resolves.toBeUndefined();
    });

    it('denies a different agent', async () => {
      await expect(
        assertCanAccessSubmission(prisma, { sub: 'agent-2', role: 'agent' }, submission),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows the tenant named on the submission', async () => {
      await expect(
        assertCanAccessSubmission(
          prisma,
          { sub: 't-1', role: 'tenant', email: 'tenant@example.com' },
          submission,
        ),
      ).resolves.toBeUndefined();
    });

    it('matches the tenant regardless of email casing', async () => {
      await expect(
        assertCanAccessSubmission(
          prisma,
          { sub: 't-1', role: 'tenant', email: 'Tenant@Example.COM' },
          submission,
        ),
      ).resolves.toBeUndefined();
    });

    it('denies an unrelated tenant', async () => {
      await expect(
        assertCanAccessSubmission(
          prisma,
          { sub: 't-2', role: 'tenant', email: 'someone@else.com' },
          submission,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('denies a tenant whose token carries no email rather than failing open', async () => {
      await expect(
        assertCanAccessSubmission(prisma, { sub: 't-3', role: 'tenant' }, submission),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows a field agent holding an assignment', async () => {
      prisma.fieldAssignment.findFirst.mockResolvedValue({ id: 'fa-1' });

      await expect(
        assertCanAccessSubmission(prisma, { sub: 'fa-user', role: 'field_agent' }, submission),
      ).resolves.toBeUndefined();
    });

    it('denies a field agent with no assignment', async () => {
      prisma.fieldAssignment.findFirst.mockResolvedValue(null);

      await expect(
        assertCanAccessSubmission(prisma, { sub: 'fa-user', role: 'field_agent' }, submission),
      ).rejects.toThrow(ForbiddenException);
    });

    it('denies an unknown role', async () => {
      await expect(
        assertCanAccessSubmission(prisma, { sub: 'x', role: 'something_else' }, submission),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assertCanModifyAsFieldAgent', () => {
    it('allows an actively assigned field agent', async () => {
      prisma.fieldAssignment.findFirst.mockResolvedValue({ id: 'fa-1' });

      await expect(
        assertCanModifyAsFieldAgent(prisma, 'fa-user', 'sub-1'),
      ).resolves.toBeUndefined();

      expect(prisma.fieldAssignment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['assigned', 'in_progress'] },
          }),
        }),
      );
    });

    it('denies when the assignment is no longer live', async () => {
      prisma.fieldAssignment.findFirst.mockResolvedValue(null);

      await expect(assertCanModifyAsFieldAgent(prisma, 'fa-user', 'sub-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
