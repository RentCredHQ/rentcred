<script setup lang="ts">
// Auth layout — split screen with branding (matches .pen design)
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left: Branding Panel -->
    <div class="hidden lg:flex w-[720px] bg-[#0D0D0D] flex-col items-center justify-center gap-6 flex-shrink-0">
      <UiRentCredLogo :size="40" variant="dark" :show-text="true" :horizontal="true" />
      <p class="text-white/50 text-base font-sans text-center leading-relaxed max-w-[340px]">
        Tenant verification for the<br />Nigerian rental market
      </p>
      <div class="w-[60px] h-0.5 bg-[#FF8400] opacity-40" />
    </div>

    <!-- Right: Auth Form -->
    <div class="flex-1 flex items-center justify-center bg-card p-5 sm:p-8">
      <div class="w-full max-w-[420px]">
        <slot />
      </div>
    </div>
  </div>
</template>
