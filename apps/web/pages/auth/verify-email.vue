<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const resent = ref(false)

function resendEmail() {
  resent.value = true
  setTimeout(() => { resent.value = false }, 3000)
}
</script>

<template>
  <div class="text-center">
    <span class="material-symbols-rounded text-[56px] text-[#FF8400] mb-4 block">mail</span>
    <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">Check your email</h1>
    <p class="font-sans text-[15px] text-muted-foreground mb-8 leading-relaxed">
      We've sent a verification link to<br />
      <strong class="text-foreground">your registered email</strong>
    </p>

    <a
      href="mailto:"
      class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity mb-4 block text-center"
    >
      Open Email App
    </a>

    <button
      class="text-sm font-sans text-[#FF8400] hover:underline mb-4 block mx-auto"
      :class="{ 'opacity-50 pointer-events-none': resent }"
      @click="resendEmail"
    >
      {{ resent ? 'Verification email resent!' : 'Resend verification email (placeholder)' }}
    </button>

    <NuxtLink to="/auth/login" class="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors block">
      Back to Sign In
    </NuxtLink>
  </div>
</template>
