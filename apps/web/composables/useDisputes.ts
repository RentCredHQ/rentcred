export function useDisputes() {
  const { api } = useApi()

  async function getDisputes(params?: { page?: number; limit?: number; status?: string }) {
    return api<{ data: any[]; pagination: any }>('/disputes', { params })
  }

  async function getDispute(id: string) {
    return api<any>(`/disputes/${id}`)
  }

  async function createDispute(data: { submissionId: string; reason: string; description: string }) {
    return api<any>('/disputes', { method: 'POST', body: data })
  }

  async function resolveDispute(id: string, data: { status: string; resolution?: string }) {
    return api<any>(`/disputes/${id}/resolve`, { method: 'PATCH', body: data })
  }

  return { getDisputes, getDispute, createDispute, resolveDispute }
}
