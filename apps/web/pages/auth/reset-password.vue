<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const { api } = useApi()
const form = reactive({ password: '', confirmPassword: '' })
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  if (form.password !== form.confirmPassword) { error.value = 'Passwords do not match'; return }
  if (form.password.length < 8) { error.value = 'Password must be at least 8 characters'; return }
  isLoading.value = true; error.value = ''
  try {
    await api('/auth/reset-password', { method: 'POST', body: { token: route.query.token, password: form.password } })
    success.value = true
  } catch (e: any) { error.value = e.data?.message || 'Reset failed' }
  finally { isLoading.value = false }
}
</script>

<template>
  <div class="text-center">
    <template v-if="!success">
      <span class="material-symbols-rounded text-5xl text-muted-foreground mb-4 block">key</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Reset your password</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-8">Create a new password for your account.</p>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm font-sans px-4 py-3 mb-6 text-left">{{ error }}</div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5 text-left">
        <div>
          <label class="block text-sm font-sans font-medium text-foreground mb-2">New Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Min. 8 characters"
            required
            class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-sans font-medium text-foreground mb-2">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Re-enter password"
            required
            class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <NuxtLink to="/auth/login" class="mt-6 inline-block text-sm font-sans text-[#FF8400] hover:underline">
        Back to Sign In
      </NuxtLink>
    </template>

    <template v-else>
      <span class="material-symbols-rounded text-5xl text-[#FF8400] mb-4 block">check_circle</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Password reset!</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-8">Your password has been successfully reset.</p>
      <NuxtLink
        to="/auth/login"
        class="inline-block w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base text-center hover:opacity-90 transition-opacity"
      >
        Sign In
      </NuxtLink>
    </template>
  </div>
</template>
