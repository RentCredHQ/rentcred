// ============================================
// Submission Status Flow
// ============================================

export const SUBMISSION_STATUSES = [
  'pending',
  'in_progress',
  'field_visit',
  'report_building',
  'completed',
  'rejected',
] as const;

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  in_progress: 'In Progress',
  field_visit: 'Field Visit',
  report_building: 'Building Report',
  completed: 'Completed',
  rejected: 'Rejected',
};

// ============================================
// Credit Bundles
// ============================================

export const DEFAULT_CREDIT_BUNDLES = [
  { name: 'Basic', credits: 5, priceNgn: 25000 },
  { name: 'Standard', credits: 15, priceNgn: 60000 },
  { name: 'Premium', credits: 50, priceNgn: 175000 },
] as const;

// ============================================
// Verification Checklist Items
// ============================================

export const VERIFICATION_CHECKLIST_ITEMS = [
  'identity_verified',
  'employment_verified',
  'references_verified',
  'address_verified',
  'criminal_check_done',
  'field_visit_completed',
] as const;

// ============================================
// Nigerian States
// ============================================

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

// ============================================
// Property Types (Nigerian Rental Market)
// ============================================

export const PROPERTY_TYPES = [
  'Self-Contain',
  'Mini Flat',
  'Apartment',
  'Flat',
  '2-Bedroom Flat',
  '3-Bedroom Flat',
  'Duplex',
  'Detached House',
  'Penthouse',
  'Shop/Office Space',
] as const;

export const PROPERTY_CONDITIONS = [
  'New Build',
  'Fairly Used',
  'Renovated',
] as const;

export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;
