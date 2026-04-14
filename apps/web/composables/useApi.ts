import type { FetchOptions } from 'ofetch'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function api<T>(url: string, options?: FetchOptions): Promise<T> {
    return $fetch<T>(url, {
      baseURL: config.public.apiBaseUrl,
      ...options,
      headers: {
        ...options?.headers as Record<string, string>,
        ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
      },
      onResponseError({ response }) {
        if (response.status === 401) {
          authStore.logout()
        }
      },
    })
  }

  return { api }
}
