export function usePayments() {
  const { api } = useApi()

  async function getBundles() {
    return api<{ data: any[] }>('/payments/bundles', {
      method: 'GET',
    })
  }

  async function purchaseBundle(bundleId: string) {
    return api<{ data: any }>('/payments/purchase', {
      method: 'POST',
      body: { bundleId },
    })
  }

  async function verifyTransaction(reference: string) {
    return api<{ data: any }>(`/payments/verify/${reference}`, {
      method: 'GET',
    })
  }

  async function getTransactionHistory(params?: { page?: number; limit?: number; type?: string }) {
    return api<{ data: any[]; pagination: any }>('/payments/history', {
      method: 'GET',
      params,
    })
  }

  async function getPaymentStats() {
    return api<any>('/payments/stats')
  }

  return {
    getBundles,
    purchaseBundle,
    verifyTransaction,
    getTransactionHistory,
    getPaymentStats,
  }
}
