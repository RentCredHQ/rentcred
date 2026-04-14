export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Restore auth state from localStorage on app init
  const token = localStorage.getItem('rentcred_token')
  if (token) {
    authStore.token = token
    await authStore.fetchUser()
  }
})
