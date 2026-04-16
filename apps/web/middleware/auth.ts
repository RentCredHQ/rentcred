export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Public routes that don't require auth
  const publicRoutes = ['/', '/for-landlords', '/about', '/contact', '/privacy', '/terms', '/ndpr', '/careers', '/status']
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']

  if (publicRoutes.includes(to.path) || authRoutes.includes(to.path)) {
    return
  }

  // Prefix-based public route matching
  if (to.path.startsWith('/careers') || to.path.startsWith('/status')) {
    return
  }

  // Tenant invite routes are public
  if (to.path.startsWith('/tenant/invite/')) {
    return
  }

  // Shared report routes are public
  if (to.path.startsWith('/reports/shared/')) {
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  // Role-based route protection
  if (to.path.startsWith('/field-agent') && authStore.user?.role !== 'field_agent') {
    return navigateTo('/auth/login')
  }

  if (to.path.startsWith('/settings') && !authStore.isAgent) {
    return navigateTo('/auth/login')
  }

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
