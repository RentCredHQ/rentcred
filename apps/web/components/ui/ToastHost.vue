<script setup lang="ts">
const { toasts, dismiss } = useToast()

const icons: Record<string, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
}
</script>

<template>
  <Teleport to="body">
    <div class="rc-toast-stack" role="status" aria-live="polite">
      <TransitionGroup name="rc-toast">
        <div v-for="t in toasts" :key="t.id" class="rc-toast" :class="t.kind">
          <span class="material-symbols-rounded">{{ icons[t.kind] || 'info' }}</span>
          <span class="flex-1">{{ t.message }}</span>
          <button
            class="text-white/40 hover:text-white transition-colors"
            aria-label="Dismiss notification"
            @click="dismiss(t.id)"
          >
            <span class="material-symbols-rounded" style="font-size: 16px">close</span>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.rc-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.rc-toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
