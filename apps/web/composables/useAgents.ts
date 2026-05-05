export function useAgents() {
  const { api } = useApi()

  async function getProfile() {
    return api<any>('/agent/profile', {
      method: 'GET',
    })
  }

  async function updateProfile(data: any) {
    return api<any>('/agent/profile', {
      method: 'PATCH',
      body: data,
    })
  }

  async function getDashboardStats() {
    return api<any>('/agent/dashboard/stats', {
      method: 'GET',
    })
  }

  return {
    getProfile,
    updateProfile,
    getDashboardStats,
  }
}
