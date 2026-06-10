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
  Case: { bg: 'bg-st-blue-bg', text: 'text-st-blue-text' },
  Report: { bg: 'bg-st-green-bg', text: 'text-st-green-text' },
  System: { bg: 'bg-st-red-bg', text: 'text-st-red-text' },
  Auth: { bg: 'bg-st-amber-bg', text: 'text-st-amber-text' },
  Payment: { bg: 'bg-st-amber-bg', text: 'text-st-amber-text' },
}

const summary = ref<any[]>([])
const events = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalEvents = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalEvents.value / 20)))

function goPage(dir: number) {
  const next = currentPage.value + dir
  if (next < 1 || next > totalPages.value) return
  currentPage.value = next
  // Re-fetch when backend supports pagination
}

onMounted(async () => {
  try {
    const res = await getAuditLogs() as any
    // Backend returns { data: auditLogs[], pagination: {...} }
    // Each log: { id, userId, action, entityType, entityId, metadata, ipAddress, createdAt, user: {id, name, email, role} }
    const logs = Array.isArray(res) ? res : res?.events ?? res?.data ?? []

    // Map entityType to display category
    function mapCategory(entityType: string, action: string): string {
      if (action?.includes('login') || action?.includes('auth') || action?.includes('password')) return 'Auth'
      if (entityType === 'submission' || entityType === 'field_visit') return 'Case'
      if (entityType === 'report') return 'Report'
      if (entityType === 'transaction') return 'Payment'
      return 'System'
    }

    events.value = logs.map((evt: any) => {
      const category = evt.category ?? mapCategory(evt.entityType ?? '', evt.action ?? '')
      return {
        ...evt,
        user: evt.user?.name ?? evt.user ?? '—',
        action: evt.action?.replace(/_/g, ' ') ?? '—',
        category,
        time: evt.createdAt ? new Date(evt.createdAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : evt.time ?? '—',
        ip: evt.ipAddress ?? evt.ip ?? '—',
        categoryBg: categoryStyles[category]?.bg ?? 'bg-surface',
        categoryText: categoryStyles[category]?.text ?? 'text-foreground',
      }
    })
    totalEvents.value = res?.pagination?.total ?? events.value.length
    if (res?.summary) {
      summary.value = res.summary
    } else {
      summary.value = [
        { label: 'Events (24h)', value: String(events.value.length), valueColor: 'text-foreground' },
        { label: 'Critical Flags', value: String(events.value.filter((e: any) => e.category === 'System').length), valueColor: 'text-st-red-text' },
        { label: 'Unique Users', value: String(new Set(events.value.map((e: any) => e.user)).size), valueColor: 'text-foreground' },
        { label: 'Failed Logins', value: String(events.value.filter((e: any) => e.action?.toLowerCase().includes('failed login')).length), valueColor: 'text-st-amber-text' },
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
      <h1 class="font-mono text-xl sm:text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Audit Log</h1>
    </div>

    <!-- Summary Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="s in summary" :key="s.label" class="bg-card border border-border rounded-lg px-4 py-3.5 flex flex-col gap-1.5">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ s.label }}</span>
        <span class="font-mono text-xl font-bold" :class="s.valueColor">{{ s.value }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="categoryTabs" variant="pill" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by user, action or IP..." width="w-full sm:w-[280px]" />
    </div>

    <!-- Log Table -->
    <div class="bg-card border border-border rounded-lg overflow-hidden">
      <!-- Desktop -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Timestamp</span></div>
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">User</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Category</span></div>
          <div class="w-[120px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">IP Address</span></div>
        </div>

        <!-- Empty State -->
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">history</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No audit entries</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Activity logs will appear here</p>
          </div>
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
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">history</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No audit entries</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Activity logs will appear here</p>
          </div>
        </div>
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
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalEvents }} events</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(-1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-card border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <span class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">{{ currentPage }}</span>
          <button @click="goPage(1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
