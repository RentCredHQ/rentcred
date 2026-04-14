export function useTenantProfile() {
  const { api } = useApi()

  async function getProfile() {
    return api<any>('/tenants/profile')
  }

  async function getProfileStatus() {
    return api<{
      step1_personal: boolean
      step2_employment: boolean
      step3_references: boolean
      step4_documents: boolean
      consentGiven: boolean
      profileComplete: boolean
    }>('/tenants/profile/status')
  }

  async function updatePersonalInfo(data: any) {
    return api('/tenants/profile/personal', { method: 'PATCH', body: data })
  }

  async function updateEmployment(data: any) {
    return api('/tenants/profile/employment', { method: 'PATCH', body: data })
  }

  async function updateReferences(data: any) {
    return api('/tenants/profile/references', { method: 'PATCH', body: data })
  }

  async function updateDocuments(data: any) {
    return api('/tenants/profile/documents', { method: 'PATCH', body: data })
  }

  async function recordConsent() {
    return api('/tenants/profile/consent', { method: 'POST' })
  }

  async function getMySubmissions(params?: { page?: number; limit?: number }) {
    return api<{ data: any[]; pagination: any }>('/tenants/my-submissions', { params })
  }

  async function getMyReports() {
    return api<{ data: any[] }>('/tenants/my-reports')
  }

  return {
    getProfile,
    getProfileStatus,
    updatePersonalInfo,
    updateEmployment,
    updateReferences,
    updateDocuments,
    recordConsent,
    getMySubmissions,
    getMyReports,
  }
}
