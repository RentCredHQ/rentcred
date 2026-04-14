// ============================================
// User Types
// ============================================

export type UserRole = 'admin' | 'agent' | 'tenant' | 'ops' | 'field_agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

// ============================================
// Submission Types
// ============================================

export type SubmissionStatus =
  | 'pending'
  | 'in_progress'
  | 'field_visit'
  | 'report_building'
  | 'completed'
  | 'rejected';

export interface Submission {
  id: string;
  agentId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyAddress: string;
  annualRent: number;
  monthlyRent: number;
  propertyType: string;
  bedrooms: number;
  state: string;
  lga: string;
  neighborhood: string;
  landlordName: string;
  landlordPhone: string;
  propertyCondition?: string;
  propertyImages: string[];
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Report Types
// ============================================

export type ReportStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface Report {
  id: string;
  submissionId: string;
  content: ReportContent;
  status: ReportStatus;
  shareToken?: string;
  createdAt: string;
}

export interface ReportContent {
  tenantInfo: {
    name: string;
    email: string;
    phone: string;
  };
  propertyInfo: {
    address: string;
    annualRent: number;
    monthlyRent: number;
    propertyType: string;
    bedrooms: number;
    state: string;
    lga: string;
    neighborhood: string;
    landlordName: string;
    landlordPhone: string;
    propertyCondition?: string;
    propertyImages: string[];
  };
  verificationResults: {
    identityVerified: boolean;
    employmentVerified: boolean;
    referencesVerified: boolean;
    addressVerified: boolean;
    criminalCheckClear: boolean;
  };
  fieldVisitSummary?: string;
  overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'fail';
  recommendation: string;
  notes?: string;
}

// ============================================
// Payment Types
// ============================================

export interface CreditBundle {
  id: string;
  name: string;
  credits: number;
  priceNgn: number;
}

export type TransactionType = 'purchase' | 'deduction' | 'refund';

export interface Transaction {
  id: string;
  agentId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
}

// ============================================
// KYB Types
// ============================================

export type KybStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';

// ============================================
// Review Types
// ============================================

export type ReviewStatus = 'published' | 'flagged' | 'removed';

export interface Review {
  id: string;
  submissionId: string;
  tenantId: string;
  agentRating: number;
  agentComment?: string;
  landlordRating: number;
  landlordComment?: string;
  propertyRating: number;
  propertyComment?: string;
  isAnonymous: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

// ============================================
// Dispute Types
// ============================================

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface AgentDashboardStats {
  totalSubmissions: number;
  pendingVerifications: number;
  completedReports: number;
  creditBalance: number;
}

export interface OpsDashboardStats {
  totalCases: number;
  pendingVerifications: number;
  fieldVisitsToday: number;
  reportsToApprove: number;
  activeFieldAgents: number;
  pendingKYB: number;
}
