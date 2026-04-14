<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await authStore.login(form.email, form.password)
    const role = authStore.user?.role
    if (role === 'agent') router.push('/dashboard')
    else if (role === 'ops' || role === 'admin') router.push('/ops')
    else if (role === 'tenant') router.push('/tenant')
    else router.push('/')
  } catch (e: any) {
    error.value = e.data?.message || 'Invalid email or password'
  }
}
</script>

<template>
  <div>
    <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Welcome back</h1>
    <p class="font-sans text-[15px] text-muted-foreground mb-8">Sign in to your account.</p>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm font-sans px-4 py-3 mb-6">
      {{ error }}
    </div>

    <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
      <div>
        <label class="block text-sm font-sans font-medium text-foreground mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="name@company.com"
          required
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-sans font-medium text-foreground">Password</label>
          <NuxtLink to="/auth/forgot-password" class="text-sm font-sans text-[#FF8400] hover:underline">
            Forgot password?
          </NuxtLink>
        </div>
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          required
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
        />
      </div>

      <button
        type="submit"
        class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-4 my-6">
      <div class="flex-1 h-px bg-border" />
      <span class="text-muted-foreground text-sm font-sans">or</span>
      <div class="flex-1 h-px bg-border" />
    </div>

    <!-- Google Button -->
    <button class="w-full py-3 border border-border text-foreground font-sans text-sm font-medium flex items-center justify-center gap-3 hover:bg-surface transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Continue with Google
    </button>

    <p class="mt-6 text-center text-sm font-sans text-muted-foreground">
      Don't have an account?
      <NuxtLink to="/auth/register" class="text-[#FF8400] hover:underline">Register</NuxtLink>
    </p>
  </div>
</template>
