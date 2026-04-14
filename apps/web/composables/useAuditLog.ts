export function useAuditLog() {
  const { api } = useApi()

  async function getAuditLogs(params?: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    entityType?: string
    entityId?: string
  }) {
    return api<{ data: any[]; pagination: any }>('/audit', { params })
  }

  return { getAuditLogs }
}
