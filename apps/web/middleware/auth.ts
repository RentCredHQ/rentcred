export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Public routes that don't require auth
  const publicRoutes = ['/', '/for-landlords', '/about', '/contact', '/privacy', '/terms', '/ndpr']
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']

  if (publicRoutes.includes(to.path) || authRoutes.includes(to.path)) {
    return
  }

  // Tenant invite routes are public
  if (to.path.startsWith('/tenant/invite/')) {
    return
  }

  // Shared report routes are public
  if (to.path.startsWith('/report/')) {
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  // Role-based route protection
  if (to.path.startsWith('/dashboard') && !authStore.isAgent) {
    return navigateTo('/auth/login')
  }

  if (to.path.startsWith('/ops') && !authStore.isOps && !authStore.isAdmin) {
    return navigateTo('/auth/login')
  }

  if (to.path.startsWith('/tenant') && !to.path.startsWith('/tenant/invite/') && !authStore.isTenant) {
    return navigateTo('/auth/login')
  }
})
