export function useNotifications() {
  const { api } = useApi()

  async function getNotifications(params?: { page?: number; limit?: number }) {
    return api<{ data: any[]; pagination: any }>('/notifications', { params })
  }

  async function markAsRead(id: string) {
    return api<any>(`/notifications/${id}/read`, { method: 'PATCH' })
  }

  async function markAllAsRead() {
    return api<any>('/notifications/read-all', { method: 'PATCH' })
  }

  return { getNotifications, markAsRead, markAllAsRead }
}
