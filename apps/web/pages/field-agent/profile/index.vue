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
    const res = await api('/field-agents/dashboard/stats')
    stats.value = res
  } catch { /* empty */ }
  finally { loading.value = false }
})

const initials = computed(() => {
  const name = user.value?.name ?? ''
  const parts = name.split(' ')
  return parts.map((p: string) => p.charAt(0)).join('').slice(0, 2).toUpperCase()
})

const menuItems = [
  { label: 'Personal Information', icon: 'person', to: '/field-agent/profile/edit' },
  { label: 'Verification History', icon: 'history', to: '' },
  { label: 'Earnings & Payments', icon: 'payments', to: '' },
  { label: 'Notifications', icon: 'notifications', to: '' },
  { label: 'Help & Support', icon: 'help', to: '' },
]
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-3">
      <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
        <span class="font-mono text-xl font-semibold text-white">{{ initials }}</span>
      </div>
      <span class="font-sans text-lg font-semibold text-foreground">{{ user?.name ?? '—' }}</span>
      <span class="bg-[#E9E3D8] text-[#804200] rounded-full px-3 py-1 text-[11px] font-semibold">{{ user?.role ?? 'Field Agent' }}</span>
      <span class="font-sans text-[13px] text-muted-foreground">{{ user?.email ?? '—' }}</span>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1">
        <span class="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">Completed</span>
        <span class="font-mono text-xl font-bold text-[#004D1A]">{{ stats?.completed ?? '—' }}</span>
      </div>
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1">
        <span class="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">Rating</span>
        <div class="flex items-center gap-1">
          <span class="material-symbols-rounded text-[16px] text-primary">star</span>
          <span class="font-mono text-xl font-bold text-primary">{{ stats?.rating ?? '—' }}</span>
        </div>
      </div>
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1">
        <span class="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">SLA Met</span>
        <span class="font-mono text-xl font-bold text-foreground">{{ stats?.slaMet ?? '—' }}</span>
      </div>
    </div>
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <component
        v-for="(item, i) in menuItems"
        :key="item.label"
        :is="item.to ? 'NuxtLink' : 'div'"
        :to="item.to || undefined"
        class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-background transition-colors"
        :class="i < menuItems.length - 1 ? 'border-b border-border' : ''"
      >
        <span class="material-symbols-rounded text-[20px] text-muted-foreground">{{ item.icon }}</span>
        <span class="font-sans text-sm text-foreground flex-1">{{ item.label }}</span>
        <span class="material-symbols-rounded text-[18px] text-muted-foreground">chevron_right</span>
      </component>
    </div>
    <button class="flex items-center justify-center gap-2 h-12 border border-[#8C1C00] text-[#8C1C00] rounded-xl font-mono text-[13px] font-semibold">
      <span class="material-symbols-rounded text-[18px]">logout</span>
      Sign Out
    </button>
    <span class="text-center font-sans text-[11px] text-muted-foreground mt-2">RentCred v1.0.0 · Field Agent</span>
  </div>
</template>
