<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { api } = useApi()
const email = ref('')
const submitted = ref(false)
const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  isLoading.value = true
  error.value = ''
  try {
    await api('/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    submitted.value = true
  } catch (e: any) {
    error.value = e.data?.message || 'Something went wrong'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="text-center">
    <template v-if="!submitted">
      <span class="material-symbols-rounded text-5xl text-muted-foreground mb-4 block">lock</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Forgot your password?</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-8">Enter your email and we'll send you a reset link.</p>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm font-sans px-4 py-3 mb-6 text-left">{{ error }}</div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5 text-left">
        <div>
          <label class="block text-sm font-sans font-medium text-foreground mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <NuxtLink to="/auth/login" class="mt-6 inline-block text-sm font-sans text-[#FF8400] hover:underline">
        Back to Sign In
      </NuxtLink>
    </template>

    <template v-else>
      <span class="material-symbols-rounded text-5xl text-[#FF8400] mb-4 block">mark_email_read</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Check your email</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-8">We've sent a password reset link to <strong class="text-foreground">{{ email }}</strong></p>
      <NuxtLink to="/auth/login" class="text-sm font-sans text-[#FF8400] hover:underline">Back to Sign In</NuxtLink>
    </template>
  </div>
</template>
