import {
  loginSchema,
  registerSchema,
  createSubmissionSchema,
  createReviewSchema,
  tenantPersonalInfoSchema,
  tenantEmploymentSchema,
  tenantReferencesSchema,
} from '@rentcred/shared';

describe('Shared Validation Schemas', () => {
  // =============================================
  // loginSchema
  // =============================================
  describe('loginSchema', () => {
    it('should pass with valid input', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when email is missing', () => {
      const result = loginSchema.safeParse({
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when password is empty', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  // =============================================
  // registerSchema
  // =============================================
  describe('registerSchema', () => {
    const validInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepass123',
      role: 'agent',
    };

    it('should pass with valid input', () => {
      const result = registerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should fail when password is too short', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8');
      }
    });

    it('should fail with invalid role', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });

    it('should accept tenant role', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        role: 'tenant',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with short name', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        name: 'A',
      });
      expect(result.success).toBe(false);
    });
  });

  // =============================================
  // createSubmissionSchema
  // =============================================
  describe('createSubmissionSchema', () => {
    const validSubmission = {
      tenantName: 'Jane Doe',
      tenantEmail: 'jane@example.com',
      tenantPhone: '08012345678',
      propertyAddress: '123 Main Street, Lagos',
      annualRent: 1200000,
      propertyType: 'apartment',
      bedrooms: 2,
      state: 'Lagos',
      lga: 'Ikeja',
      neighborhood: 'GRA Ikeja',
      landlordName: 'Mr. Landlord',
      landlordPhone: '08098765432',
      consentObtained: true,
    };

    it('should pass with valid submission', () => {
      const result = createSubmissionSchema.safeParse(validSubmission);
      expect(result.success).toBe(true);
    });

    it('should fail when tenantName is missing', () => {
      const { tenantName, ...rest } = validSubmission;
      const result = createSubmissionSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid email', () => {
      const result = createSubmissionSchema.safeParse({
        ...validSubmission,
        tenantEmail: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with negative annualRent', () => {
      const result = createSubmissionSchema.safeParse({
        ...validSubmission,
        annualRent: -5000,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when required fields are missing', () => {
      const result = createSubmissionSchema.safeParse({
        tenantName: 'Jane',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Multiple required fields should fail
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it('should fail when consentObtained is false', () => {
      const result = createSubmissionSchema.safeParse({
        ...validSubmission,
        consentObtained: false,
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = createSubmissionSchema.safeParse({
        ...validSubmission,
        monthlyRent: 100000,
        propertyCondition: 'good',
        notes: 'Additional notes',
        employerName: 'Acme Corp',
        monthlyIncome: 500000,
      });
      expect(result.success).toBe(true);
    });
  });

  // =============================================
  // createReviewSchema
  // =============================================
  describe('createReviewSchema', () => {
    const validReview = {
      submissionId: 'sub-123',
      agentRating: 4,
      landlordRating: 3,
      propertyRating: 5,
    };

    it('should pass with valid review', () => {
      const result = createReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should fail when rating is below 1', () => {
      const result = createReviewSchema.safeParse({
        ...validReview,
        agentRating: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when rating is above 5', () => {
      const result = createReviewSchema.safeParse({
        ...validReview,
        propertyRating: 6,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when submissionId is missing', () => {
      const { submissionId, ...rest } = validReview;
      const result = createReviewSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('should fail with non-integer rating', () => {
      const result = createReviewSchema.safeParse({
        ...validReview,
        agentRating: 3.5,
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional comments and isAnonymous', () => {
      const result = createReviewSchema.safeParse({
        ...validReview,
        agentComment: 'Great agent',
        landlordComment: 'OK landlord',
        propertyComment: 'Nice property',
        isAnonymous: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isAnonymous).toBe(true);
      }
    });

    it('should default isAnonymous to false', () => {
      const result = createReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isAnonymous).toBe(false);
      }
    });
  });

  // =============================================
  // tenantPersonalInfoSchema
  // =============================================
  describe('tenantPersonalInfoSchema', () => {
    const validInfo = {
      dateOfBirth: '1990-01-15',
      gender: 'male',
      maritalStatus: 'single',
      stateOfOrigin: 'Lagos',
      currentAddress: '45 Allen Avenue, Ikeja',
    };

    it('should pass with valid input', () => {
      const result = tenantPersonalInfoSchema.safeParse(validInfo);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid gender', () => {
      const result = tenantPersonalInfoSchema.safeParse({
        ...validInfo,
        gender: 'unknown',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid gender values', () => {
      for (const gender of ['male', 'female', 'other']) {
        const result = tenantPersonalInfoSchema.safeParse({ ...validInfo, gender });
        expect(result.success).toBe(true);
      }
    });

    it('should accept optional ninNumber with exactly 11 characters', () => {
      const result = tenantPersonalInfoSchema.safeParse({
        ...validInfo,
        ninNumber: '12345678901',
      });
      expect(result.success).toBe(true);
    });
  });

  // =============================================
  // tenantEmploymentSchema
  // =============================================
  describe('tenantEmploymentSchema', () => {
    const validEmployment = {
      employerName: 'Acme Corp',
      employerAddress: '10 Marina Road, Lagos',
      jobTitle: 'Software Engineer',
      monthlyIncome: 500000,
      employmentType: 'full_time',
    };

    it('should pass with valid input', () => {
      const result = tenantEmploymentSchema.safeParse(validEmployment);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid employmentType', () => {
      const result = tenantEmploymentSchema.safeParse({
        ...validEmployment,
        employmentType: 'freelance',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid employment types', () => {
      for (const type of ['full_time', 'part_time', 'self_employed', 'unemployed']) {
        const result = tenantEmploymentSchema.safeParse({
          ...validEmployment,
          employmentType: type,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should fail with non-positive monthly income', () => {
      const result = tenantEmploymentSchema.safeParse({
        ...validEmployment,
        monthlyIncome: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  // =============================================
  // tenantReferencesSchema
  // =============================================
  describe('tenantReferencesSchema', () => {
    const validRefs = {
      ref1Name: 'John Smith',
      ref1Phone: '08012345678',
      ref1Relationship: 'Colleague',
      ref2Name: 'Jane Smith',
      ref2Phone: '08098765432',
      ref2Relationship: 'Neighbor',
    };

    it('should pass with valid input', () => {
      const result = tenantReferencesSchema.safeParse(validRefs);
      expect(result.success).toBe(true);
    });

    it('should fail when reference fields are missing', () => {
      const result = tenantReferencesSchema.safeParse({
        ref1Name: 'John',
        ref1Phone: '08012345678',
        // missing ref1Relationship, ref2Name, ref2Phone, ref2Relationship
      });
      expect(result.success).toBe(false);
    });

    it('should fail with short phone number', () => {
      const result = tenantReferencesSchema.safeParse({
        ...validRefs,
        ref1Phone: '080',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with short name', () => {
      const result = tenantReferencesSchema.safeParse({
        ...validRefs,
        ref2Name: 'A',
      });
      expect(result.success).toBe(false);
    });
  });
});
