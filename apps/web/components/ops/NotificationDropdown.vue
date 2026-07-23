<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}

const { notifications, loading, loaded, errored, unreadCount, load, handleRead, handleMarkAllRead } =
  useNotificationFeed('/ops')

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
    <div v-if="modelValue" class="absolute right-0 top-full mt-2 w-[360px] bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
      <div class="fixed inset-0 z-[-1]" @click="close" />

      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <span class="font-mono text-sm font-semibold text-foreground">
          Notifications<template v-if="unreadCount"> ({{ unreadCount }})</template>
        </span>
        <button
          v-if="unreadCount"
          @click="handleMarkAllRead"
          class="text-[12px] font-sans text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <div v-if="loading && !notifications.length" class="px-4 py-8 flex justify-center">
          <span class="material-symbols-rounded text-[22px] text-muted-foreground animate-spin">progress_activity</span>
        </div>

        <div v-else-if="errored" class="px-4 py-8 flex flex-col items-center gap-2">
          <span class="text-[13px] font-sans text-muted-foreground">Couldn't load notifications.</span>
          <button @click="load" class="text-[12px] font-sans text-primary hover:underline">Try again</button>
        </div>

        <div v-else-if="!notifications.length" class="px-4 py-8 flex flex-col items-center gap-1">
          <span class="material-symbols-rounded text-[24px] text-muted-foreground">notifications_off</span>
          <span class="text-[13px] font-sans text-muted-foreground">No notifications yet</span>
        </div>

        <button
          v-for="n in notifications"
          :key="n.id"
          type="button"
          class="flex gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors text-left w-full"
          :class="n.read ? 'hover:bg-surface/30' : 'bg-[#FF84000A] hover:bg-[#FF840012]'"
          @click="openNotification(n)"
        >
          <div class="flex-shrink-0 mt-1.5">
            <div class="w-2 h-2 rounded-full" :class="n.dot" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[13px] font-sans block" :class="n.read ? 'text-foreground' : 'text-foreground font-semibold'">{{ n.title }}</span>
            <span class="text-[12px] font-sans text-muted-foreground block mt-0.5 line-clamp-2">{{ n.message }}</span>
            <span class="text-[11px] font-sans text-muted-foreground mt-1 block">{{ n.time }}</span>
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
