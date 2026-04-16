<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()

const handleClear = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-5">
    <div class="max-w-[480px] w-full flex flex-col items-center gap-6 text-center">
      <!-- Error Code -->
      <span class="font-mono text-[80px] sm:text-[120px] font-bold text-[#FF8400] leading-none">
        {{ error.statusCode || 500 }}
      </span>

      <!-- Message -->
      <h1 class="font-mono text-xl sm:text-2xl font-semibold text-white">
        {{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed max-w-[360px]">
        {{ error.statusCode === 404
          ? "The page you're looking for doesn't exist or has been moved."
          : "We hit an unexpected error. Try refreshing the page or head back home."
        }}
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2">
        <button
          @click="handleClear"
          class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-sm px-8 py-3 hover:bg-[#E67700] transition-colors w-full sm:w-auto text-center"
        >
          Go Home
        </button>
        <button
          @click="$router.back()"
          class="text-white/90 text-sm px-8 py-3 border border-[#3A3A3A] hover:border-[#555] hover:bg-white/[0.04] transition-all w-full sm:w-auto text-center"
        >
          Go Back
        </button>
      </div>

      <!-- Branding -->
      <p class="font-sans text-[11px] text-[#555] mt-4">
        RentCred — Tenant Verification Made Simple
      </p>
    </div>
  </div>
</template>
