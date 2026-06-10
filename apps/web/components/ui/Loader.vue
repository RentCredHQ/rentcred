<script setup lang="ts">
defineProps<{ caption?: string; size?: number; pad?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3" :class="pad || 'py-20'">
    <span
      class="material-symbols-rounded animate-spin text-muted-foreground"
      :style="{ fontSize: `${size || 32}px` }"
    >progress_activity</span>
    <p v-if="caption" class="font-mono text-xs text-muted-foreground">{{ caption }}</p>
  </div>
</template>
