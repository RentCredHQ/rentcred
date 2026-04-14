export function useKyb() {
  const { api } = useApi()

  async function getKybApplications(params?: { page?: number; limit?: number; status?: string }) {
    return api<{ data: any[]; pagination: any }>('/kyb/applications', { params })
  }

  async function getKybApplication(id: string) {
    return api<any>(`/kyb/applications/${id}`)
  }

  async function applyKyb(data: any) {
    return api<any>('/kyb/apply', { method: 'POST', body: data })
  }

  async function reviewKyb(id: string, data: { status: string; reviewNotes?: string }) {
    return api<any>(`/kyb/applications/${id}/review`, { method: 'PATCH', body: data })
  }

  return { getKybApplications, getKybApplication, applyKyb, reviewKyb }
}
