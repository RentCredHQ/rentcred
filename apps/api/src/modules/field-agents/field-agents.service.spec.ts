import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FieldAgentsService } from './field-agents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

describe('FieldAgentsService', () => {
  let service: FieldAgentsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let auditService: AuditService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    fieldAssignment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    fieldVisit: {
      create: jest.fn(),
      count: jest.fn(),
    },
    verificationChecklist: {
      updateMany: jest.fn(),
    },
    submission: {
      findUnique: jest.fn(),
    },
  };

  const mockNotificationsService = {
    emit: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldAgentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<FieldAgentsService>(FieldAgentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockAgents = [
      {
        id: 'fa-1',
        name: 'Agent One',
        email: 'agent1@example.com',
        phone: '08011111111',
        avatarUrl: null,
        isVerified: true,
        createdAt: new Date(),
        assignments: [
          { id: 'a-1', status: 'pending' },
          { id: 'a-2', status: 'completed' },
          { id: 'a-3', status: 'in_progress' },
        ],
      },
    ];

    it('should list field agents with enriched assignment counts', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockAgents);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].activeAssignments).toBe(2);
      expect(result.data[0].completedAssignments).toBe(1);
      expect(result.data[0].totalAssignments).toBe(3);
      expect(result.data[0].assignments).toBeUndefined();
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by name when search is provided', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll({ search: 'Agent One' });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'field_agent',
            OR: [
              { name: { contains: 'Agent One', mode: 'insensitive' } },
              { email: { contains: 'Agent One', mode: 'insensitive' } },
              { phone: { contains: 'Agent One', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should paginate correctly', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(50);

      const result = await service.findAll({ page: 3, limit: 10 });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
    });
  });

  describe('findOne', () => {
    const agentId = 'fa-1';

    it('should return agent with stats and recent assignments', async () => {
      const mockAgent = {
        id: agentId,
        name: 'Agent One',
        email: 'agent1@example.com',
        phone: '08011111111',
        avatarUrl: null,
        isVerified: true,
        createdAt: new Date(),
        assignments: [
          {
            id: 'a-1',
            submission: {
              id: 'sub-1',
              tenantName: 'Jane Doe',
              propertyAddress: '123 Main St',
              status: 'pending',
            },
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.fieldAssignment.count
        .mockResolvedValueOnce(2)  // active
        .mockResolvedValueOnce(5)  // completed
        .mockResolvedValueOnce(7); // total

      const result = await service.findOne(agentId);

      expect(result.stats).toEqual({
        activeAssignments: 2,
        completedAssignments: 5,
        totalAssignments: 7,
      });
      expect(result.recentAssignments).toEqual(mockAgent.assignments);
      expect(result.assignments).toBeUndefined();
    });

    it('should throw NotFoundException when agent not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyAssignments', () => {
    const fieldAgentId = 'fa-1';

    it('should return own assignments', async () => {
      const mockAssignments = [
        {
          id: 'a-1',
          fieldAgentId,
          status: 'pending',
          submission: {
            id: 'sub-1',
            tenantName: 'Jane Doe',
            tenantPhone: '08099999999',
            propertyAddress: '123 Main St',
            status: 'in_progress',
          },
        },
      ];

      mockPrismaService.fieldAssignment.findMany.mockResolvedValue(mockAssignments);
      mockPrismaService.fieldAssignment.count.mockResolvedValue(1);

      const result = await service.getMyAssignments(fieldAgentId);

      expect(result.data).toEqual(mockAssignments);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply status filter when provided', async () => {
      mockPrismaService.fieldAssignment.findMany.mockResolvedValue([]);
      mockPrismaService.fieldAssignment.count.mockResolvedValue(0);

      await service.getMyAssignments(fieldAgentId, { status: 'completed' });

      expect(mockPrismaService.fieldAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { fieldAgentId, status: 'completed' },
        }),
      );
    });

    it('should paginate correctly', async () => {
      mockPrismaService.fieldAssignment.findMany.mockResolvedValue([]);
      mockPrismaService.fieldAssignment.count.mockResolvedValue(30);

      const result = await service.getMyAssignments(fieldAgentId, {
        page: 2,
        limit: 10,
      });

      expect(mockPrismaService.fieldAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 30,
        totalPages: 3,
      });
    });
  });

  describe('updateAssignmentStatus', () => {
    const assignmentId = 'a-1';
    const fieldAgentId = 'fa-1';

    const mockAssignment = {
      id: assignmentId,
      fieldAgentId,
      status: 'in_progress',
    };

    it('should update status successfully', async () => {
      const mockUpdated = { ...mockAssignment, status: 'in_progress' };

      mockPrismaService.fieldAssignment.findUnique.mockResolvedValue(mockAssignment);
      mockPrismaService.fieldAssignment.update.mockResolvedValue(mockUpdated);

      const result = await service.updateAssignmentStatus(
        assignmentId,
        fieldAgentId,
        { status: 'in_progress' },
      );

      expect(result).toEqual(mockUpdated);
    });

    it('should set completedAt when status is completed', async () => {
      mockPrismaService.fieldAssignment.findUnique.mockResolvedValue(mockAssignment);
      mockPrismaService.fieldAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'completed',
        completedAt: new Date(),
      });

      await service.updateAssignmentStatus(assignmentId, fieldAgentId, {
        status: 'completed',
      });

      expect(mockPrismaService.fieldAssignment.update).toHaveBeenCalledWith({
        where: { id: assignmentId },
        data: expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should throw ForbiddenException when assignment belongs to another agent', async () => {
      mockPrismaService.fieldAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        fieldAgentId: 'other-agent',
      });

      await expect(
        service.updateAssignmentStatus(assignmentId, fieldAgentId, {
          status: 'completed',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when assignment not found', async () => {
      mockPrismaService.fieldAssignment.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAssignmentStatus('nonexistent', fieldAgentId, {
          status: 'completed',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitVisitReport', () => {
    const fieldAgentId = 'fa-1';
    const dto = {
      submissionId: 'sub-1',
      visitDate: '2026-03-20',
      gpsLatitude: 6.5244,
      gpsLongitude: 3.3792,
      photos: ['photo1.jpg', 'photo2.jpg'],
      notes: 'Property verified',
      checklistItems: { exterior: true, interior: true },
      summary: 'All checks passed',
    };

    const mockAssignment = {
      id: 'a-1',
      submissionId: 'sub-1',
      fieldAgentId,
    };

    const mockVisit = {
      id: 'visit-1',
      submissionId: dto.submissionId,
      fieldAgentId,
      visitDate: new Date(dto.visitDate),
      gpsLatitude: dto.gpsLatitude,
      gpsLongitude: dto.gpsLongitude,
      photos: dto.photos,
      notes: dto.notes,
      summary: dto.summary,
    };

    it('should create a field visit record', async () => {
      mockPrismaService.fieldAssignment.findFirst.mockResolvedValue(mockAssignment);
      mockPrismaService.fieldVisit.create.mockResolvedValue(mockVisit);
      mockPrismaService.verificationChecklist.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.fieldAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'completed',
      });
      mockPrismaService.submission.findUnique.mockResolvedValue({
        agentId: 'agent-1',
        tenantName: 'Jane Doe',
        assignedOpsId: 'ops-1',
      });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.submitVisitReport(fieldAgentId, dto as any);

      expect(result).toEqual(mockVisit);
      expect(mockPrismaService.fieldVisit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionId: dto.submissionId,
          fieldAgentId,
          visitDate: new Date(dto.visitDate),
          gpsLatitude: dto.gpsLatitude,
          gpsLongitude: dto.gpsLongitude,
          photos: dto.photos,
          notes: dto.notes,
          summary: dto.summary,
        }),
      });
    });

    it('should mark fieldVisitCompleted on the checklist', async () => {
      mockPrismaService.fieldAssignment.findFirst.mockResolvedValue(mockAssignment);
      mockPrismaService.fieldVisit.create.mockResolvedValue(mockVisit);
      mockPrismaService.verificationChecklist.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.fieldAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'completed',
      });
      mockPrismaService.submission.findUnique.mockResolvedValue({
        agentId: 'agent-1',
        tenantName: 'Jane Doe',
        assignedOpsId: null,
      });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.submitVisitReport(fieldAgentId, dto as any);

      expect(mockPrismaService.verificationChecklist.updateMany).toHaveBeenCalledWith({
        where: { submissionId: dto.submissionId },
        data: { fieldVisitCompleted: true },
      });
    });

    it('should complete the assignment', async () => {
      mockPrismaService.fieldAssignment.findFirst.mockResolvedValue(mockAssignment);
      mockPrismaService.fieldVisit.create.mockResolvedValue(mockVisit);
      mockPrismaService.verificationChecklist.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.fieldAssignment.update.mockResolvedValue({
        ...mockAssignment,
        status: 'completed',
      });
      mockPrismaService.submission.findUnique.mockResolvedValue({
        agentId: 'agent-1',
        tenantName: 'Jane Doe',
        assignedOpsId: null,
      });
      mockNotificationsService.emit.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.submitVisitReport(fieldAgentId, dto as any);

      expect(mockPrismaService.fieldAssignment.update).toHaveBeenCalledWith({
        where: { id: mockAssignment.id },
        data: expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should throw ForbiddenException when not assigned to submission', async () => {
      mockPrismaService.fieldAssignment.findFirst.mockResolvedValue(null);

      await expect(
        service.submitVisitReport(fieldAgentId, dto as any),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.fieldVisit.create).not.toHaveBeenCalled();
    });
  });

  describe('getDashboardStats', () => {
    it('should return correct counts', async () => {
      const fieldAgentId = 'fa-1';

      mockPrismaService.fieldAssignment.count
        .mockResolvedValueOnce(3)  // active
        .mockResolvedValueOnce(10); // total
      mockPrismaService.fieldVisit.count.mockResolvedValue(8); // completed visits

      const result = await service.getDashboardStats(fieldAgentId);

      expect(result).toEqual({
        activeAssignments: 3,
        completedVisits: 8,
        totalAssignments: 10,
      });
    });
  });
});
