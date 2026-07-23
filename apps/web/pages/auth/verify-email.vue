<script setup lang="ts">
definePageMeta({ colorMode: 'light', layout: 'auth' })

const route = useRoute()
const { api } = useApi()

// The verification email links here with ?token=. This page used to ignore it
// entirely and its "resend" button was a setTimeout, so no token was ever
// redeemed and no account could be verified.
const token = computed(() => (route.query.token as string) || '')
const state = ref<'idle' | 'verifying' | 'verified' | 'failed'>('idle')
const error = ref('')

const resendEmail = ref((route.query.email as string) || '')
const resending = ref(false)
const resent = ref(false)

onMounted(async () => {
  if (!token.value) return // Arrived without a link — show the "check your email" state.

  state.value = 'verifying'
  try {
    await api('/auth/verify-email', { params: { token: token.value } })
    state.value = 'verified'
  } catch (e: any) {
    error.value = e.data?.message || 'This verification link is invalid or has expired.'
    state.value = 'failed'
  }
})

async function handleResend() {
  if (!resendEmail.value || resending.value) return
  resending.value = true
  try {
    await api('/auth/resend-verification', { method: 'POST', body: { email: resendEmail.value } })
    resent.value = true
  } catch {
    // The endpoint always reports success to avoid revealing which addresses
    // have accounts; treat a transport failure the same way.
    resent.value = true
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="text-center">
    <!-- Redeeming a token from the email link -->
    <template v-if="state === 'verifying'">
      <span class="material-symbols-rounded text-[56px] text-muted-foreground mb-4 block animate-pulse">hourglass</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Verifying your email…</h1>
    </template>

    <template v-else-if="state === 'verified'">
      <span class="material-symbols-rounded text-[56px] text-st-green-text mb-4 block">check_circle</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Email verified</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-8">Your email address has been confirmed.</p>
      <NuxtLink
        to="/auth/login"
        class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity block text-center"
      >
        Continue to Sign In
      </NuxtLink>
    </template>

    <template v-else-if="state === 'failed'">
      <span class="material-symbols-rounded text-[56px] text-st-red-text mb-4 block">link_off</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Link not valid</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-6">{{ error }}</p>

      <div v-if="!resent" class="flex flex-col gap-3 mb-6 text-left">
        <label class="text-sm font-sans font-medium text-foreground">Send a new link to</label>
        <input
          v-model="resendEmail"
          type="email"
          placeholder="you@company.com"
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
        />
        <button
          class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
          :disabled="!resendEmail || resending"
          @click="handleResend"
        >
          {{ resending ? 'Sending…' : 'Send new link' }}
        </button>
      </div>
      <p v-else class="font-sans text-sm text-st-green-text mb-6">
        If that address has an unverified account, a new link is on its way.
      </p>

      <NuxtLink to="/auth/login" class="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors block">
        Back to Sign In
      </NuxtLink>
    </template>

    <!-- Landed here straight after registering, with no token to redeem -->
    <template v-else>
      <span class="material-symbols-rounded text-[56px] text-[#FF8400] mb-4 block">mail</span>
      <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Check your email</h1>
      <p class="font-sans text-[15px] text-muted-foreground mb-8 leading-relaxed">
        We've sent a verification link to<br />
        <strong class="text-foreground">{{ resendEmail || 'your registered email' }}</strong>
      </p>

      <div v-if="!resent" class="flex flex-col gap-3 mb-6 text-left">
        <input
          v-model="resendEmail"
          type="email"
          placeholder="you@company.com"
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
        />
        <button
          class="text-sm font-sans text-[#FF8400] hover:underline disabled:opacity-50"
          :disabled="!resendEmail || resending"
          @click="handleResend"
        >
          {{ resending ? 'Sending…' : 'Resend verification email' }}
        </button>
      </div>
      <p v-else class="font-sans text-sm text-st-green-text mb-6">Verification email resent.</p>

      <NuxtLink to="/auth/login" class="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors block">
        Back to Sign In
      </NuxtLink>
    </template>
  </div>
</template>
