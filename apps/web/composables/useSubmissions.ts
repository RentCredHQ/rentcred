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
    return api<{ data: Submission }>('/submissions', {
      method: 'POST',
      body: data,
    })
  }

  async function updateSubmissionStatus(id: string, status: string) {
    return api<{ data: Submission }>(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
  }

  async function assignFieldAgent(id: string, fieldAgentId: string, scheduledDate?: Date) {
    return api<{ data: any }>(`/submissions/${id}/assign`, {
      method: 'POST',
      body: { fieldAgentId, scheduledDate },
    })
  }

  async function reassignCase(id: string, data: { fieldAgentId: string; reason?: string }) {
    return api<any>(`/submissions/${id}/reassign`, { method: 'POST', body: data })
  }

  return {
    getSubmission,
    getSubmissions,
    createSubmission,
    updateSubmissionStatus,
    assignFieldAgent,
    reassignCase,
  }
}
