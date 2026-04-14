export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      const token = localStorage.getItem('rentcred_token')
      if (token) {
        options.headers = {
          ...options.headers as Record<string, string>,
          Authorization: `Bearer ${token}`,
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        localStorage.removeItem('rentcred_token')
        navigateTo('/auth/login')
      }
    },
  })

  return {
    provide: { api },
  }
})
