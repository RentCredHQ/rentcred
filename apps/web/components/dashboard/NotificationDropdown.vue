<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
const close = () => emit('update:modelValue', false)

const { notifications, loading, loaded, errored, unreadCount, load, handleRead, handleMarkAllRead } =
  useNotificationFeed('/dashboard')

// Fetch on first open, and refresh on each subsequent open so the list is not
// stale after actions taken elsewhere in the session.
watch(() => props.modelValue, (open: boolean) => {
  // The layout loads these for the unread badge; refresh on open so the list
  // reflects anything that happened since.
  if (open && (!loaded.value || !loading.value)) load()
})

async function openNotification(n: { id: string; link: string | null }) {
  await handleRead(n.id)
  if (n.link) {
    close()
    navigateTo(n.link)
  }
}

defineExpose({ unreadCount })
</script>

<template>
  <Transition name="dropdown">
    <div v-if="modelValue" class="absolute right-0 top-full mt-2 w-[360px] bg-card rounded-xl border border-border shadow-xl flex flex-col overflow-hidden z-50">
      <div class="fixed inset-0 z-[-1]" @click="close" />

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-border">
        <span class="font-mono text-[15px] font-semibold text-foreground">
          Notifications<template v-if="unreadCount"> ({{ unreadCount }})</template>
        </span>
        <button
          v-if="unreadCount"
          @click="handleMarkAllRead"
          class="font-sans text-xs font-medium text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>

      <!-- List -->
      <div class="flex flex-col max-h-[400px] overflow-y-auto">
        <div v-if="loading && !notifications.length" class="px-5 py-8 flex justify-center">
          <span class="material-symbols-rounded text-[22px] text-muted-foreground animate-spin">progress_activity</span>
        </div>

        <div v-else-if="errored" class="px-5 py-8 flex flex-col items-center gap-2">
          <span class="font-sans text-[13px] text-muted-foreground">Couldn't load notifications.</span>
          <button @click="load" class="font-sans text-xs font-medium text-primary hover:underline">Try again</button>
        </div>

        <div v-else-if="!notifications.length" class="px-5 py-8 flex flex-col items-center gap-1">
          <span class="material-symbols-rounded text-[24px] text-muted-foreground">notifications_off</span>
          <span class="font-sans text-[13px] text-muted-foreground">No notifications yet</span>
        </div>

        <button
          v-for="n in notifications"
          :key="n.id"
          type="button"
          class="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-background transition-colors cursor-pointer text-left w-full"
          :class="!n.read ? 'bg-[#FF84000A]' : ''"
          @click="openNotification(n)"
        >
          <div class="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" :class="n.dot" />
          <div class="flex flex-col gap-1 flex-1 min-w-0">
            <span class="font-sans text-[13px] text-foreground" :class="n.read ? 'font-normal' : 'font-semibold'">{{ n.title }}</span>
            <span class="font-sans text-xs text-muted-foreground leading-snug">{{ n.message }}</span>
            <span class="font-sans text-[11px] text-muted-foreground/60 mt-0.5">{{ n.time }}</span>
          </div>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
