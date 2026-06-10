<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-surface"
    :class="compact ? 'w-9 h-9' : 'w-10 h-10 border border-border'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <ClientOnly>
      <span class="material-symbols-rounded text-[20px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
      <template #fallback>
        <span class="material-symbols-rounded text-[20px]">dark_mode</span>
      </template>
    </ClientOnly>
  </button>
</template>
