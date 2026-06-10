// Unified status → hue/label mapping. One verdict language across the whole app.
// Hues map to the --color-st-* scale (see assets/css/main.css). Used by UiStatusPill.

export type StatusHue = 'green' | 'amber' | 'red' | 'blue' | 'neutral'

const STATUS_HUE: Record<string, StatusHue> = {
  // success / done
  completed: 'green', approved: 'green', verified: 'green', ready: 'green',
  paid: 'green', resolved: 'green', closed: 'green', active: 'green', success: 'green',
  // in progress / caution
  in_progress: 'amber', report_building: 'amber', under_review: 'amber',
  pending_approval: 'amber', pending_review: 'amber', partial: 'amber',
  open: 'amber', submitted: 'amber', processing: 'amber', draft: 'amber',
  // scheduled / field
  field_visit: 'blue', assigned: 'blue', scheduled: 'blue', in_review: 'blue',
  refunded: 'blue', available: 'green', busy: 'amber',
  // neutral / waiting
  pending: 'neutral', not_started: 'neutral', awaiting_tenant: 'neutral',
  unassigned: 'neutral', incomplete: 'neutral', offline: 'neutral',
  inactive: 'neutral', unknown: 'neutral',
  // negative
  rejected: 'red', failed: 'red', expired: 'red', cancelled: 'red',
  canceled: 'red', overdue: 'red', disputed: 'red', missing: 'red',
}

/** Normalize a status/label to a lookup key: "Under Review" -> "under_review". */
function normalizeKey(s: string): string {
  return s.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Resolve a status string (raw key or human label) to one of the five status hues. */
export function statusHue(status?: string | null): StatusHue {
  if (!status) return 'neutral'
  return STATUS_HUE[normalizeKey(status)] ?? 'neutral'
}

/** Human-readable label for a status (falls back to Title Case). */
export function statusLabel(status?: string | null): string {
  if (!status) return '—'
  return titleCase(String(status))
}

export function useStatus() {
  return { statusHue, statusLabel }
}
