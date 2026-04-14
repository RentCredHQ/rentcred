<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Notifications — RentCred' })

const { getNotifications, markAsRead, markAllAsRead } = useNotifications()

const activeTab = ref('all')
const tabs = ['All', 'Unread', 'Cases', 'Reports', 'System']

const allNotifications = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getNotifications()
    allNotifications.value = (Array.isArray(res) ? res : []).map((n: any) => ({
      ...n,
      iconBg: n.iconBg ?? 'bg-[#DFDFE6]',
      iconColor: n.iconColor ?? 'text-[#000066]',
      icon: n.icon ?? 'notifications',
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
})

const todayNotifications = computed(() =>
  allNotifications.value.filter((n: any) => {
    const d = new Date(n.createdAt ?? n.time ?? '')
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })
)

const yesterdayNotifications = computed(() =>
  allNotifications.value.filter((n: any) => {
    const d = new Date(n.createdAt ?? n.time ?? '')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return d.toDateString() === yesterday.toDateString()
  })
)

async function handleMarkAsRead(id: string) {
  try {
    await markAsRead(id)
    const n = allNotifications.value.find((n: any) => n.id === id)
    if (n) n.unread = false
  } catch { /* empty */ }
}

async function handleMarkAllAsRead() {
  try {
    await markAllAsRead()
    allNotifications.value.forEach((n: any) => { n.unread = false })
  } catch { /* empty */ }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/settings" class="lg:hidden">
          <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
        </NuxtLink>
        <h1 class="font-mono text-xl sm:text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Notifications</h1>
      </div>
      <button @click="handleMarkAllAsRead" class="font-sans text-[12px] font-medium text-primary hover:underline">Mark all read</button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex border-b border-border overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-4 py-2.5 font-mono text-[13px] whitespace-nowrap transition-colors"
        :class="activeTab === tab.toLowerCase() ? 'font-semibold text-foreground border-b-2 border-primary' : 'font-medium text-muted-foreground'"
        @click="activeTab = tab.toLowerCase()"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Summary Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-lg">
        <span class="material-symbols-rounded text-[16px] text-primary">notifications</span>
        <span class="font-mono text-[12px] font-semibold text-foreground">4 unread</span>
      </div>
      <div class="flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-lg">
        <span class="font-mono text-[12px] font-semibold text-[#804200]">2 need action</span>
      </div>
      <div class="flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-lg">
        <span class="font-mono text-[12px] font-medium text-muted-foreground">18 resolved this week</span>
      </div>
    </div>

    <!-- Today -->
    <div class="flex flex-col gap-0">
      <span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider mb-3">TODAY · 4</span>
      <div class="bg-white border border-border rounded-lg overflow-hidden">
        <div v-for="(notif, i) in todayNotifications" :key="i" class="flex gap-3.5 p-4 border-b border-border last:border-0" :class="notif.unread ? 'bg-white' : ''">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :class="notif.iconBg">
            <span class="material-symbols-rounded text-[20px]" :class="notif.iconColor">{{ notif.icon }}</span>
          </div>
          <div class="flex-1 flex flex-col gap-1 min-w-0">
            <span class="font-sans text-sm" :class="notif.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'">{{ notif.title }}</span>
            <span class="font-sans text-[13px] text-muted-foreground leading-[1.4]">{{ notif.desc }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ notif.time }}</span>
          </div>
          <div v-if="notif.unread" class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
        </div>
      </div>
    </div>

    <!-- Yesterday -->
    <div class="flex flex-col gap-0">
      <span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider mb-3">YESTERDAY · 2</span>
      <div class="bg-white border border-border rounded-lg overflow-hidden">
        <div v-for="(notif, i) in yesterdayNotifications" :key="i" class="flex gap-3.5 p-4 border-b border-border last:border-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :class="notif.iconBg">
            <span class="material-symbols-rounded text-[20px]" :class="notif.iconColor">{{ notif.icon }}</span>
          </div>
          <div class="flex-1 flex flex-col gap-1 min-w-0">
            <span class="font-sans text-sm font-medium text-foreground">{{ notif.title }}</span>
            <span class="font-sans text-[13px] text-muted-foreground leading-[1.4]">{{ notif.desc }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ notif.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Earlier -->
    <div class="flex flex-col gap-0">
      <span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider mb-3">EARLIER</span>
      <div class="flex items-center gap-2.5 px-4.5 py-4 bg-[#E7E8E5] border border-border rounded-lg">
        <span class="material-symbols-rounded text-[18px] text-muted-foreground">inbox</span>
        <span class="font-sans text-[13px] font-medium text-muted-foreground">No older notifications</span>
      </div>
    </div>
  </div>
</template>
