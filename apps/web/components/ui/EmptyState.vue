<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  helper?: string
  cta?: string
  ctaTo?: string
}>()
const emit = defineEmits<{ (e: 'cta'): void }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground">{{ icon || 'inbox' }}</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <h3 class="font-mono text-base font-semibold text-foreground">{{ title }}</h3>
      <p v-if="helper" class="font-sans text-sm text-muted-foreground max-w-[320px]">{{ helper }}</p>
    </div>
    <NuxtLink
      v-if="cta && ctaTo"
      :to="ctaTo"
      class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      {{ cta }}
    </NuxtLink>
    <button
      v-else-if="cta"
      class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-semibold hover:opacity-90 transition-opacity"
      @click="emit('cta')"
    >
      {{ cta }}
    </button>
  </div>
</template>
