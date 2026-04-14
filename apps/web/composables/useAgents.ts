export function useAgents() {
  const { api } = useApi()

  async function getProfile() {
    return api<{ data: any }>('/agents/profile', {
      method: 'GET',
    })
  }

  async function updateProfile(data: any) {
    return api<{ data: any }>('/agents/profile', {
      method: 'PATCH',
      body: data,
    })
  }

  async function getDashboardStats() {
    return api<{ data: any }>('/agents/stats', {
      method: 'GET',
    })
  }

  return {
    getProfile,
    updateProfile,
    getDashboardStats,
  }
}
