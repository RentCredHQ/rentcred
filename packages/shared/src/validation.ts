import { z } from 'zod';

// ============================================
// Auth Validation Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['agent', 'tenant']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================
// Submission Validation Schemas
// ============================================

export const createSubmissionSchema = z.object({
  tenantName: z.string().min(2, 'Tenant name is required'),
  tenantEmail: z.string().email('Invalid email address'),
  tenantPhone: z.string().min(10, 'Valid phone number required'),
  propertyAddress: z.string().min(5, 'Property address is required'),
  annualRent: z.number().positive('Annual rent must be positive'),
  monthlyRent: z.number().positive().optional(),
  propertyType: z.string().min(1, 'Property type is required'),
  bedrooms: z.number().min(0).max(6, 'Bedrooms must be between 0 and 6'),
  state: z.string().min(1, 'State is required'),
  lga: z.string().min(1, 'LGA is required'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  landlordName: z.string().min(2, 'Landlord name is required'),
  landlordPhone: z.string().min(10, 'Valid landlord phone number required'),
  propertyCondition: z.string().optional(),
  propertyImages: z.array(z.string()).max(5).optional(),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  monthlyIncome: z.number().positive().optional(),
  previousAddress: z.string().optional(),
  reasonForMoving: z.string().optional(),
  notes: z.string().optional(),
  consentObtained: z.boolean().refine((v) => v === true, 'Consent must be obtained'),
});

// ============================================
// Tenant Profile Validation Schemas
// ============================================

export const tenantPersonalInfoSchema = z.object({
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  stateOfOrigin: z.string().min(2),
  currentAddress: z.string().min(5),
  ninNumber: z.string().min(11).max(11).optional(),
});

export const tenantEmploymentSchema = z.object({
  employerName: z.string().min(2),
  employerAddress: z.string().min(5),
  jobTitle: z.string().min(2),
  monthlyIncome: z.number().positive(),
  employmentType: z.enum(['full_time', 'part_time', 'self_employed', 'unemployed']),
});

export const tenantReferencesSchema = z.object({
  ref1Name: z.string().min(2),
  ref1Phone: z.string().min(10),
  ref1Relationship: z.string().min(2),
  ref2Name: z.string().min(2),
  ref2Phone: z.string().min(10),
  ref2Relationship: z.string().min(2),
});

// ============================================
// Review Validation Schema
// ============================================

export const createReviewSchema = z.object({
  submissionId: z.string().min(1, 'Submission is required'),
  agentRating: z.number().int().min(1).max(5, 'Rating must be 1-5'),
  agentComment: z.string().optional(),
  landlordRating: z.number().int().min(1).max(5, 'Rating must be 1-5'),
  landlordComment: z.string().optional(),
  propertyRating: z.number().int().min(1).max(5, 'Rating must be 1-5'),
  propertyComment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type TenantPersonalInfoInput = z.infer<typeof tenantPersonalInfoSchema>;
export type TenantEmploymentInput = z.infer<typeof tenantEmploymentSchema>;
export type TenantReferencesInput = z.infer<typeof tenantReferencesSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
