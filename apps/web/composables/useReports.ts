export function useReports() {
  const { api } = useApi()

  async function getReports(params?: { page?: number; limit?: number; status?: string }) {
    return api<{ data: any[]; pagination: any }>('/reports', { params })
  }

  async function getReport(id: string) {
    return api<any>(`/reports/${id}`)
  }

  async function shareReport(id: string, data?: { email?: string }) {
    return api<{ shareToken: string; shareUrl: string }>(`/reports/${id}/share`, {
      method: 'POST',
      body: data,
    })
  }

  async function reviewReport(id: string, data: { status: string; notes?: string }) {
    return api<any>(`/reports/${id}/review`, { method: 'PATCH', body: data })
  }

  async function getSharedReport(token: string) {
    return api<any>(`/reports/shared/${token}`)
  }

  return { getReports, getReport, shareReport, reviewReport, getSharedReport }
}
