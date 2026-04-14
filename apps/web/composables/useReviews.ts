export function useReviews() {
  const { api } = useApi()

  async function createReview(data: {
    submissionId: string
    agentRating: number
    agentComment?: string
    landlordRating: number
    landlordComment?: string
    propertyRating: number
    propertyComment?: string
    isAnonymous?: boolean
  }) {
    return api('/reviews', { method: 'POST', body: data })
  }

  async function getReviewForSubmission(submissionId: string) {
    return api<any>(`/reviews/submission/${submissionId}`)
  }

  async function getAgentReviews(agentId: string, params?: { page?: number; limit?: number }) {
    return api<any>(`/reviews/agent/${agentId}`, { params })
  }

  async function getMyReviews() {
    return api<{ data: any[] }>('/reviews/my')
  }

  return { createReview, getReviewForSubmission, getAgentReviews, getMyReviews }
}
