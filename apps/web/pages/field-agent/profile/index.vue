<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Profile — RentCred Field Agent' })

const { api } = useApi()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const stats = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api('/field-agents/dashboard/stats') as any
    stats.value = {
      completed: res?.completedVisits ?? res?.completed ?? 0,
      active: res?.activeAssignments ?? res?.pending ?? 0,
      total: res?.totalAssignments ?? 0,
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

const initials = computed(() => {
  const name = user.value?.name ?? ''
  return name.split(' ').map((p: string) => p.charAt(0)).join('').slice(0, 2).toUpperCase()
})

const menuItems = [
  { label: 'Personal Information', icon: 'person', to: '/field-agent/profile/edit' },
  { label: 'My Assignments', icon: 'assignment', to: '/field-agent/visits' },
  { label: 'Visit History', icon: 'history', to: '/field-agent/visits?status=completed' },
  { label: 'Schedule', icon: 'calendar_today', to: '/field-agent/schedule' },
  { label: 'Notifications', icon: 'notifications', to: '/field-agent/notifications' },
]


</script>

<template>
  <div class="flex flex-col gap-5 max-w-[480px] mx-auto">
    <!-- Profile Card -->
    <div class="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-3">
      <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
        <span class="font-mono text-xl font-semibold text-foreground">{{ initials }}</span>
      </div>
      <span class="font-sans text-lg font-semibold text-foreground">{{ user?.name ?? '—' }}</span>
      <span class="bg-[#E9E3D8] text-[#804200] rounded-full px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider">Field Agent</span>
      <span class="font-sans text-[13px] text-muted-foreground">{{ user?.email ?? '—' }}</span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1">
        <span class="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">Completed</span>
        <span class="font-mono text-xl font-bold text-[#004D1A]">{{ stats?.completed ?? '—' }}</span>
      </div>
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1">
        <span class="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">Active</span>
        <span class="font-mono text-xl font-bold text-primary">{{ stats?.active ?? '—' }}</span>
      </div>
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1">
        <span class="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">Total</span>
        <span class="font-mono text-xl font-bold text-foreground">{{ stats?.total ?? '—' }}</span>
      </div>
    </div>

    <!-- Menu -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <NuxtLink
        v-for="(item, i) in menuItems"
        :key="item.label"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-3.5 hover:bg-surface transition-colors"
        :class="i < menuItems.length - 1 ? 'border-b border-border' : ''"
      >
        <span class="material-symbols-rounded text-[20px] text-muted-foreground">{{ item.icon }}</span>
        <span class="font-sans text-sm text-foreground flex-1">{{ item.label }}</span>
        <span class="material-symbols-rounded text-[18px] text-muted-foreground">chevron_right</span>
      </NuxtLink>
    </div>

    <span class="text-center font-sans text-[11px] text-muted-foreground mt-2">RentCred v1.0.0</span>
  </div>
</template>
