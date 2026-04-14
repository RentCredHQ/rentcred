import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdatePersonalInfoDto,
  UpdateEmploymentDto,
  UpdateReferencesDto,
  UpdateDocumentsDto,
} from './dto/tenant-profile.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get tenant profile with user info.
   */
  async getProfile(userId: string, requesterId: string, requesterRole: string) {
    const profile = await this.prisma.tenantProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    if (!profile) throw new NotFoundException('Tenant profile not found');

    // Tenants can only view their own profile; ops/admin can view any
    if (requesterRole === 'tenant' && userId !== requesterId) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return profile;
  }

  /**
   * Get profile completion status (which steps are done).
   */
  async getProfileStatus(userId: string) {
    const profile = await this.prisma.tenantProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Tenant profile not found');

    const personalComplete = !!(
      profile.dateOfBirth &&
      profile.gender &&
      profile.currentAddress &&
      profile.ninNumber
    );
    const employmentComplete = !!(profile.employerName && profile.employmentType);
    const referencesComplete = !!(
      profile.ref1Name &&
      profile.ref1Phone &&
      profile.ref2Name &&
      profile.ref2Phone
    );
    const documentsComplete = !!profile.idDocumentUrl;

    return {
      step1_personal: personalComplete,
      step2_employment: employmentComplete,
      step3_references: referencesComplete,
      step4_documents: documentsComplete,
      consentGiven: profile.consentGiven,
      profileComplete: profile.profileComplete,
    };
  }

  /**
   * Step 1 — Update personal information.
   */
  async updatePersonalInfo(userId: string, dto: UpdatePersonalInfoDto) {
    return this.prisma.tenantProfile.update({
      where: { userId },
      data: {
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.maritalStatus && { maritalStatus: dto.maritalStatus }),
        ...(dto.stateOfOrigin && { stateOfOrigin: dto.stateOfOrigin }),
        ...(dto.currentAddress && { currentAddress: dto.currentAddress }),
        ...(dto.ninNumber && { ninNumber: dto.ninNumber }),
      },
    });
  }

  /**
   * Step 2 — Update employment info.
   */
  async updateEmployment(userId: string, dto: UpdateEmploymentDto) {
    return this.prisma.tenantProfile.update({
      where: { userId },
      data: {
        ...(dto.employerName && { employerName: dto.employerName }),
        ...(dto.employerAddress && { employerAddress: dto.employerAddress }),
        ...(dto.jobTitle && { jobTitle: dto.jobTitle }),
        ...(dto.monthlyIncome !== undefined && { monthlyIncome: dto.monthlyIncome }),
        ...(dto.employmentType && { employmentType: dto.employmentType }),
      },
    });
  }

  /**
   * Step 3 — Update references.
   */
  async updateReferences(userId: string, dto: UpdateReferencesDto) {
    return this.prisma.tenantProfile.update({
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
  }

  /**
   * Step 4 — Update document URLs (after client uploads to S3).
   */
  async updateDocuments(userId: string, dto: UpdateDocumentsDto) {
    return this.prisma.tenantProfile.update({
      where: { userId },
      data: {
        ...(dto.idDocumentUrl && { idDocumentUrl: dto.idDocumentUrl }),
        ...(dto.proofOfIncomeUrl && { proofOfIncomeUrl: dto.proofOfIncomeUrl }),
        ...(dto.utilityBillUrl && { utilityBillUrl: dto.utilityBillUrl }),
      },
    });
  }

  /**
   * Record NDPR consent.
   */
  async recordConsent(userId: string) {
    const profile = await this.prisma.tenantProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Tenant profile not found');
    if (profile.consentGiven) {
      throw new BadRequestException('Consent already recorded');
    }

    // Check if profile is complete enough to give consent
    const status = await this.getProfileStatus(userId);
    if (!status.step1_personal) {
      throw new BadRequestException('Complete personal information before giving consent');
    }

    const updated = await this.prisma.tenantProfile.update({
      where: { userId },
      data: {
        consentGiven: true,
        consentDate: new Date(),
        profileComplete:
          status.step1_personal &&
          status.step2_employment &&
          status.step3_references &&
          status.step4_documents,
      },
    });

    return { message: 'Consent recorded', profileComplete: updated.profileComplete };
  }

  /**
   * Get submissions where this tenant is the verification subject.
   */
  async findSubmissionsByTenantEmail(userId: string, options: { page: number; limit: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where: { tenantEmail: user.email },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          agent: { select: { name: true } },
          verificationChecklist: {
            select: {
              identityVerified: true,
              employmentVerified: true,
              referencesVerified: true,
              addressVerified: true,
              criminalCheckDone: true,
              fieldVisitCompleted: true,
            },
          },
          report: { select: { id: true, status: true, shareToken: true } },
        },
      }),
      this.prisma.submission.count({ where: { tenantEmail: user.email } }),
    ]);

    return {
      data: submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get approved reports about this tenant.
   */
  async findReportsByTenantEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const reports = await this.prisma.report.findMany({
      where: {
        status: 'approved',
        submission: { tenantEmail: user.email },
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

    return { data: reports };
  }
}
