import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tenantProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    report: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    const userId = 'user-1';
    const mockProfile = {
      id: 'profile-1',
      userId,
      dateOfBirth: new Date(),
      gender: 'male',
      currentAddress: '123 Main St',
      ninNumber: '12345678901',
      user: {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        phone: '08012345678',
        avatarUrl: null,
      },
    };

    it('should return own profile', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile(userId, userId, 'tenant');

      expect(result).toEqual(mockProfile);
      expect(mockPrismaService.tenantProfile.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
          },
        },
      });
    });

    it('should throw ForbiddenException when tenant tries to view another profile', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue(mockProfile);

      await expect(
        service.getProfile(userId, 'other-user', 'tenant'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ops to view any profile', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile(userId, 'ops-user', 'ops');

      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.getProfile('nonexistent', 'nonexistent', 'tenant'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfileStatus', () => {
    const userId = 'user-1';

    it('should return all true when all steps are complete', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue({
        userId,
        dateOfBirth: new Date(),
        gender: 'male',
        currentAddress: '123 Main St',
        ninNumber: '12345678901',
        employerName: 'Acme Corp',
        employmentType: 'full_time',
        ref1Name: 'Ref One',
        ref1Phone: '08011111111',
        ref2Name: 'Ref Two',
        ref2Phone: '08022222222',
        idDocumentUrl: 'https://s3.amazonaws.com/doc.pdf',
        consentGiven: true,
        profileComplete: true,
      });

      const result = await service.getProfileStatus(userId);

      expect(result).toEqual({
        step1_personal: true,
        step2_employment: true,
        step3_references: true,
        step4_documents: true,
        consentGiven: true,
        profileComplete: true,
      });
    });

    it('should return mixed results for partial completion', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue({
        userId,
        dateOfBirth: new Date(),
        gender: 'male',
        currentAddress: '123 Main St',
        ninNumber: '12345678901',
        employerName: null,
        employmentType: null,
        ref1Name: null,
        ref1Phone: null,
        ref2Name: null,
        ref2Phone: null,
        idDocumentUrl: null,
        consentGiven: false,
        profileComplete: false,
      });

      const result = await service.getProfileStatus(userId);

      expect(result).toEqual({
        step1_personal: true,
        step2_employment: false,
        step3_references: false,
        step4_documents: false,
        consentGiven: false,
        profileComplete: false,
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue(null);

      await expect(service.getProfileStatus('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePersonalInfo', () => {
    it('should update with partial data', async () => {
      const userId = 'user-1';
      const dto = {
        dateOfBirth: '1990-01-01',
        gender: 'male',
      };

      const mockUpdated = {
        userId,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
      };

      mockPrismaService.tenantProfile.update.mockResolvedValue(mockUpdated);

      const result = await service.updatePersonalInfo(userId, dto as any);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.tenantProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
        }),
      });
    });
  });

  describe('updateEmployment', () => {
    it('should update with partial data', async () => {
      const userId = 'user-1';
      const dto = {
        employerName: 'Acme Corp',
        employmentType: 'full_time',
      };

      const mockUpdated = { userId, ...dto };
      mockPrismaService.tenantProfile.update.mockResolvedValue(mockUpdated);

      const result = await service.updateEmployment(userId, dto as any);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.tenantProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          employerName: 'Acme Corp',
          employmentType: 'full_time',
        }),
      });
    });
  });

  describe('updateReferences', () => {
    it('should save all 6 reference fields', async () => {
      const userId = 'user-1';
      const dto = {
        ref1Name: 'Ref One',
        ref1Phone: '08011111111',
        ref1Relationship: 'colleague',
        ref2Name: 'Ref Two',
        ref2Phone: '08022222222',
        ref2Relationship: 'friend',
      };

      const mockUpdated = { userId, ...dto };
      mockPrismaService.tenantProfile.update.mockResolvedValue(mockUpdated);

      const result = await service.updateReferences(userId, dto as any);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.tenantProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          ref1Name: dto.ref1Name,
          ref1Phone: dto.ref1Phone,
          ref1Relationship: dto.ref1Relationship,
          ref2Name: dto.ref2Name,
          ref2Phone: dto.ref2Phone,
          ref2Relationship: dto.ref2Relationship,
        },
      });
    });
  });

  describe('updateDocuments', () => {
    it('should save document URLs', async () => {
      const userId = 'user-1';
      const dto = {
        idDocumentUrl: 'https://s3.amazonaws.com/id.pdf',
        proofOfIncomeUrl: 'https://s3.amazonaws.com/income.pdf',
      };

      const mockUpdated = { userId, ...dto };
      mockPrismaService.tenantProfile.update.mockResolvedValue(mockUpdated);

      const result = await service.updateDocuments(userId, dto as any);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.tenantProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          idDocumentUrl: dto.idDocumentUrl,
          proofOfIncomeUrl: dto.proofOfIncomeUrl,
        }),
      });
    });
  });

  describe('recordConsent', () => {
    const userId = 'user-1';

    const completeProfile = {
      userId,
      dateOfBirth: new Date(),
      gender: 'male',
      currentAddress: '123 Main St',
      ninNumber: '12345678901',
      employerName: 'Acme Corp',
      employmentType: 'full_time',
      ref1Name: 'Ref One',
      ref1Phone: '08011111111',
      ref2Name: 'Ref Two',
      ref2Phone: '08022222222',
      idDocumentUrl: 'https://s3.amazonaws.com/doc.pdf',
      consentGiven: false,
      profileComplete: false,
    };

    it('should set consentGiven to true and consentDate', async () => {
      // findUnique is called twice: once in recordConsent, once in getProfileStatus
      mockPrismaService.tenantProfile.findUnique
        .mockResolvedValueOnce(completeProfile)
        .mockResolvedValueOnce(completeProfile);

      mockPrismaService.tenantProfile.update.mockResolvedValue({
        ...completeProfile,
        consentGiven: true,
        consentDate: new Date(),
        profileComplete: true,
      });

      const result = await service.recordConsent(userId);

      expect(result).toEqual({
        message: 'Consent recorded',
        profileComplete: true,
      });
      expect(mockPrismaService.tenantProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          consentGiven: true,
          consentDate: expect.any(Date),
          profileComplete: true,
        }),
      });
    });

    it('should throw BadRequestException when already consented', async () => {
      mockPrismaService.tenantProfile.findUnique.mockResolvedValue({
        ...completeProfile,
        consentGiven: true,
      });

      await expect(service.recordConsent(userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when step 1 is incomplete', async () => {
      const incompleteProfile = {
        ...completeProfile,
        dateOfBirth: null,
        gender: null,
        currentAddress: null,
        ninNumber: null,
      };

      // First call for recordConsent check, second for getProfileStatus
      mockPrismaService.tenantProfile.findUnique
        .mockResolvedValueOnce(incompleteProfile)
        .mockResolvedValueOnce(incompleteProfile);

      await expect(service.recordConsent(userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set profileComplete when all steps are done', async () => {
      mockPrismaService.tenantProfile.findUnique
        .mockResolvedValueOnce(completeProfile)
        .mockResolvedValueOnce(completeProfile);

      mockPrismaService.tenantProfile.update.mockResolvedValue({
        ...completeProfile,
        consentGiven: true,
        profileComplete: true,
      });

      const result = await service.recordConsent(userId);

      expect(result.profileComplete).toBe(true);
    });
  });

  describe('findSubmissionsByTenantEmail', () => {
    const userId = 'user-1';
    const options = { page: 1, limit: 10 };

    it('should return submissions matching the tenant email', async () => {
      const mockUser = { id: userId, email: 'tenant@example.com' };
      const mockSubmissions = [
        {
          id: 'sub-1',
          tenantEmail: 'tenant@example.com',
          agent: { name: 'Agent One' },
          verificationChecklist: { identityVerified: true },
          report: { id: 'report-1', status: 'approved', shareToken: 'abc' },
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue(mockSubmissions);
      mockPrismaService.submission.count.mockResolvedValue(1);

      const result = await service.findSubmissionsByTenantEmail(userId, options);

      expect(result.data).toEqual(mockSubmissions);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.findSubmissionsByTenantEmail('nonexistent', options),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findReportsByTenantEmail', () => {
    it('should return only approved reports', async () => {
      const userId = 'user-1';
      const mockUser = { id: userId, email: 'tenant@example.com' };
      const mockReports = [
        {
          id: 'report-1',
          status: 'approved',
          submission: {
            id: 'sub-1',
            propertyAddress: '123 Main St',
            propertyType: 'apartment',
            neighborhood: 'Downtown',
            state: 'Lagos',
            agent: { name: 'Agent One' },
          },
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.report.findMany.mockResolvedValue(mockReports);

      const result = await service.findReportsByTenantEmail(userId);

      expect(result).toEqual({ data: mockReports });
      expect(mockPrismaService.report.findMany).toHaveBeenCalledWith({
        where: {
          status: 'approved',
          submission: { tenantEmail: mockUser.email },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          submission: {
            select: {
              id: true,
              propertyAddress: true,
              propertyType: true,
              neighborhood: true,
              state: true,
              agent: { select: { name: true } },
            },
          },
        },
      });
    });
  });
});
