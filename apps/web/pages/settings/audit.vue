<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Audit Log — RentCred' })

const { getAuditLogs } = useAuditLog()

const categoryTabs = [
  { label: 'All Events', value: 'all' },
  { label: 'Authentication', value: 'auth' },
  { label: 'Cases', value: 'case' },
  { label: 'Reports', value: 'report' },
  { label: 'Payments', value: 'payment' },
  { label: 'System', value: 'system' },
]

const categoryStyles: Record<string, { bg: string; text: string }> = {
  Case: { bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
  Report: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
  System: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
  Auth: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  Payment: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
}

const summary = ref<any[]>([])
const events = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getAuditLogs() as any
    const logs = Array.isArray(res) ? res : res?.events ?? res?.data ?? []
    events.value = logs.map((evt: any) => ({
      ...evt,
      categoryBg: categoryStyles[evt.category]?.bg ?? 'bg-[#E7E8E5]',
      categoryText: categoryStyles[evt.category]?.text ?? 'text-foreground',
    }))
    if (res?.summary) {
      summary.value = res.summary
    } else {
      summary.value = [
        { label: 'Events (24h)', value: String(events.value.length), valueColor: 'text-foreground' },
        { label: 'Critical Flags', value: String(events.value.filter((e: any) => e.category === 'System').length), valueColor: 'text-[#8C1C00]' },
        { label: 'Unique Users', value: String(new Set(events.value.map((e: any) => e.user)).size), valueColor: 'text-foreground' },
        { label: 'Failed Logins', value: String(events.value.filter((e: any) => e.action?.toLowerCase().includes('failed login')).length), valueColor: 'text-[#804200]' },
      ]
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: events,
  searchFields: ['user', 'action', 'ip'],
  statusField: 'category',
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/settings" class="lg:hidden">
        <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
      </NuxtLink>
      <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Audit Log</h1>
    </div>

    <!-- Summary Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="s in summary" :key="s.label" class="bg-white border border-border rounded-lg px-4 py-3.5 flex flex-col gap-1.5">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ s.label }}</span>
        <span class="font-mono text-xl font-bold" :class="s.valueColor">{{ s.value }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="categoryTabs" variant="pill" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by user, action or IP..." width="w-[280px]" />
    </div>

    <!-- Log Table -->
    <div class="bg-white border border-border rounded-lg overflow-hidden">
      <!-- Desktop -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Timestamp</span></div>
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">User</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Category</span></div>
          <div class="w-[120px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">IP Address</span></div>
        </div>

        <div v-for="evt in filtered" :key="evt.time" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[160px]"><span class="font-mono text-[12px] text-muted-foreground">{{ evt.time }}</span></div>
          <div class="w-[140px]"><span class="font-sans text-[13px] font-medium text-foreground">{{ evt.user }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-foreground">{{ evt.action }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[evt.categoryBg, evt.categoryText]">{{ evt.category }}</span>
          </div>
          <div class="w-[120px]"><span class="font-mono text-[12px] text-muted-foreground">{{ evt.ip }}</span></div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div v-for="evt in filtered" :key="evt.time" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1">
            <span class="font-sans text-sm font-medium text-foreground">{{ evt.user }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[evt.categoryBg, evt.categoryText]">{{ evt.category }}</span>
          </div>
          <span class="font-sans text-[13px] text-foreground block mb-1">{{ evt.action }}</span>
          <div class="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
            <span>{{ evt.time }}</span>
            <span>{{ evt.ip }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing 1–6 of 148 events</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
