import type { Submission } from '@rentcred/shared'

export function useSubmissions() {
  const { api } = useApi()

  async function getSubmission(id: string) {
    return api<{ data: Submission }>(`/submissions/${id}`, {
      method: 'GET',
    })
  }

  async function getSubmissions(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) {
    return api<{ data: Submission[]; pagination: any }>('/submissions', {
      method: 'GET',
      params,
    })
  }

  async function createSubmission(data: any) {
    return api<Submission>('/submissions', {
      method: 'POST',
      body: data,
    })
  }

  async function updateSubmissionStatus(id: string, status: string, notes?: string) {
    return api<{ data: Submission }>(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: { status, ...(notes ? { notes } : {}) },
    })
  }

  /**
   * Agent-initiated cancellation of a pending submission. Returns whether the
   * credit was refunded — status changes go through the ops-only route above,
   * which an agent cannot call.
   */
  async function cancelSubmission(id: string) {
    return api<{ id: string; status: string; refunded: boolean }>(`/submissions/${id}/cancel`, {
      method: 'PATCH',
    })
  }

  async function assignFieldAgent(id: string, fieldAgentId: string, scheduledDate?: Date) {
    return api<{ data: any }>(`/submissions/${id}/assign`, {
      method: 'POST',
      body: { fieldAgentId, scheduledDate },
    })
  }

  async function reassignCase(id: string, data: { fieldAgentId: string; reason?: string; scheduledDate?: string }) {
    return api<any>(`/submissions/${id}/reassign`, { method: 'POST', body: data })
  }

  return {
    getSubmission,
    getSubmissions,
    createSubmission,
    updateSubmissionStatus,
    cancelSubmission,
    assignFieldAgent,
    reassignCase,
  }
}
