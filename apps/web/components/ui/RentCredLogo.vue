<script setup lang="ts">
interface Props {
  size?: number
  variant?: 'dark' | 'light'
  showText?: boolean
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  variant: 'dark',
  showText: true,
  horizontal: true,
})

const innerFill = computed(() => props.variant === 'dark' ? '#0A0A0A' : '#F8F8F8')
const checkStroke = computed(() => props.variant === 'dark' ? '#FFFFFF' : '#1A1A1A')
const textFill = computed(() => props.variant === 'dark' ? '#FFFFFF' : '#1A1A1A')
</script>

<template>
  <div class="flex items-center" :class="horizontal ? 'flex-row' : 'flex-col'" :style="{ gap: `${size * 0.35}px` }">
    <!-- Shield Icon -->
    <svg :width="size" :height="size * 1.175" viewBox="0 0 80 94" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Shield Outer -->
      <path d="M40 0L80 19V56C80 75 64 88 40 94C16 88 0 75 0 56V19L40 0Z" fill="#FF8400" />
      <!-- Shield Inner -->
      <path d="M40 11L72 26V56C72 71 59 81 40 86C21 81 8 71 8 56V26L40 11Z" :fill="innerFill" />
      <!-- Roof -->
      <path d="M19 42L40 24L61 42" :stroke="'#FF8400'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <!-- Check -->
      <path d="M25 57L35 67L55 46" :stroke="checkStroke" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </svg>

    <!-- Wordmark -->
    <span
      v-if="showText"
      class="font-mono font-bold"
      :style="{ fontSize: `${size * 0.55}px`, color: textFill }"
    >
      RentCred
    </span>
  </div>
</template>
