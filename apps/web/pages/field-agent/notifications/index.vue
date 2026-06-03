<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Notifications — RentCred Field Agent' })

const { getNotifications, markAsRead, markAllAsRead } = useNotifications()

const notifications = ref<any[]>([])
const loading = ref(true)

async function fetchNotifications() {
  loading.value = true
  try {
    const res = await getNotifications() as any
    const items = res?.data ?? res ?? []
    notifications.value = (Array.isArray(items) ? items : []).map((n: any) => ({
      id: n.id,
      title: n.title ?? '',
      message: n.message ?? '',
      type: n.type ?? '',
      read: !!n.readAt,
      time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
}

async function handleMarkRead(id: string) {
  try {
    await markAsRead(id)
    await fetchNotifications()
  } catch { /* empty */ }
}

async function handleMarkAllRead() {
  try {
    await markAllAsRead()
    await fetchNotifications()
  } catch { /* empty */ }
}

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function iconForType(type: string) {
  if (type.includes('visit')) return 'directions_walk'
  if (type.includes('assignment')) return 'assignment'
  if (type.includes('report')) return 'description'
  if (type.includes('submission')) return 'folder_open'
  return 'notifications'
}

onMounted(() => fetchNotifications())
</script>

<template>
  <div class="flex flex-col gap-5 max-w-[640px]">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Notifications</h1>
        <span class="font-sans text-sm text-muted-foreground">{{ unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }}</span>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="handleMarkAllRead"
        class="px-4 py-2 border border-border rounded-lg font-sans text-[13px] font-medium text-foreground hover:bg-surface transition-colors"
      >
        Mark all read
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
      <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
        <span class="material-symbols-rounded text-[28px] text-muted-foreground">notifications_off</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <h3 class="font-mono text-base font-semibold text-foreground">No notifications</h3>
        <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">You'll be notified when you receive new assignments or updates</p>
      </div>
    </div>

    <div v-else class="flex flex-col">
      <button
        v-for="n in notifications"
        :key="n.id"
        @click="!n.read && handleMarkRead(n.id)"
        class="flex items-start gap-3 px-4 py-4 border-b border-border last:border-0 text-left transition-colors"
        :class="n.read ? 'bg-background' : 'bg-card hover:bg-surface'"
      >
        <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" :class="n.read ? 'bg-[#E7E8E5]' : 'bg-primary/10'">
          <span class="material-symbols-rounded text-[18px]" :class="n.read ? 'text-muted-foreground' : 'text-primary'">{{ iconForType(n.type) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-sans text-[13px] font-medium text-foreground">{{ n.title }}</span>
            <div v-if="!n.read" class="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
          </div>
          <p class="font-sans text-[13px] text-muted-foreground mt-0.5 line-clamp-2">{{ n.message }}</p>
          <span class="font-sans text-[11px] text-muted-foreground mt-1 block">{{ n.time }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
