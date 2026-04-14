import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'agent' | 'tenant' | 'ops' | 'field_agent'
  avatarUrl?: string
  kybStatus?: 'pending' | 'submitted' | 'approved' | 'rejected'
  creditBalance?: number
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAgent: (state) => state.user?.role === 'agent',
    isAdmin: (state) => state.user?.role === 'admin',
    isOps: (state) => state.user?.role === 'ops',
    isTenant: (state) => state.user?.role === 'tenant',
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api<{ user: User; token: string }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.user = response.user
        this.token = response.token
        localStorage.setItem('rentcred_token', response.token)
        return response
      } finally {
        this.isLoading = false
      }
    },

    async register(data: { name: string; email: string; password: string; role: 'agent' | 'tenant' }) {
      this.isLoading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api<{ user: User; token: string }>('/auth/register', {
          method: 'POST',
          body: data,
        })
        this.user = response.user
        this.token = response.token
        localStorage.setItem('rentcred_token', response.token)
        return response
      } finally {
        this.isLoading = false
      }
    },

    async fetchUser() {
      const token = localStorage.getItem('rentcred_token')
      if (!token) return

      this.token = token
      try {
        const { $api } = useNuxtApp()
        this.user = await $api<User>('/auth/me')
      } catch {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('rentcred_token')
      navigateTo('/auth/login')
    },
  },
})
