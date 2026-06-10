<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Dispute Resolution — RentCred' })

const { getDisputes } = useDisputes()

const kpis = ref([
  { label: 'TOTAL DISPUTES', value: '0', sub: '', valueColor: 'text-foreground' },
  { label: 'OPEN', value: '0', sub: '', valueColor: 'text-[#804200]' },
  { label: 'RESOLVED', value: '0', sub: '', valueColor: 'text-[#004D1A]' },
  { label: 'AVG RESOLUTION', value: '—', sub: '', valueColor: 'text-foreground', smallValue: true },
])

const disputes = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalDisputes = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalDisputes.value / 20)))

function goPage(dir: number) {
  const next = currentPage.value + dir
  if (next < 1 || next > totalPages.value) return
  currentPage.value = next
  // Re-fetch when backend supports pagination
}

const showNewDispute = ref(false)

function getStatusStyle(status: string) {
  switch (status) {
    case 'resolved': case 'closed': return { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]', label: status === 'closed' ? 'Closed' : 'Resolved' }
    case 'under_review': return { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]', label: 'Under Review' }
    case 'open': return { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]', label: 'Open' }
    default: return { bg: 'bg-blue-50', text: 'text-blue-600', label: status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }
  }
}

onMounted(async () => {
  try {
    const res = await getDisputes() as any
    const rawDisputes = res?.data ?? []

    disputes.value = rawDisputes.map((d: any) => {
      const style = getStatusStyle(d.status)
      return {
        id: d.id,
        parties: `${d.raisedBy?.name ?? '—'} / ${d.submission?.agent?.name ?? '—'}`,
        reason: d.reason ?? '—',
        priority: 'Medium',
        priorityBg: 'bg-[#E9E3D8]',
        priorityText: 'text-[#804200]',
        status: style.label,
        statusBg: style.bg,
        statusText: style.text,
        deadline: d.resolvedAt ? 'Closed' : '—',
      }
    })

    totalDisputes.value = rawDisputes.length
    const total = rawDisputes.length
    const open = rawDisputes.filter((d: any) => d.status === 'open' || d.status === 'under_review').length
    const resolved = rawDisputes.filter((d: any) => d.status === 'resolved' || d.status === 'closed').length

    kpis.value = [
      { label: 'TOTAL DISPUTES', value: String(total), sub: '', valueColor: 'text-foreground' },
      { label: 'OPEN', value: String(open), sub: '', valueColor: 'text-[#804200]' },
      { label: 'RESOLVED', value: String(resolved), sub: '', valueColor: 'text-[#004D1A]' },
      { label: 'AVG RESOLUTION', value: '—', sub: '', valueColor: 'text-foreground', smallValue: true },
    ]
  } catch { /* empty */ }
  finally { loading.value = false }
})

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Escalated', value: 'escalated' },
]

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: disputes,
  searchFields: ['id', 'parties', 'reason'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/settings" class="lg:hidden">
          <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
        </NuxtLink>
        <h1 class="font-mono text-xl sm:text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Dispute Resolution</h1>
      </div>
      <button @click="showNewDispute = true" class="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
        <span class="material-symbols-rounded text-[16px]">add</span>
        New Dispute
      </button>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-white border border-border rounded-lg p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono font-bold" :class="[kpi.valueColor, kpi.smallValue ? 'text-2xl' : 'text-[28px]']">{{ kpi.value }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Filters -->
    <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />

    <!-- Disputes Table -->
    <div class="bg-white border border-border rounded-lg overflow-hidden">
      <!-- Table Header Row -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">DISPUTE LOG</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
        <UiFilterSearch v-model="searchQuery" placeholder="Search disputes..." width="w-[200px]" />
      </div>

      <!-- Desktop -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Dispute ID</span></div>
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Parties</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Reason</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Priority</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[110px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Deadline</span></div>
          <div class="w-[70px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <!-- Empty State -->
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">gavel</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No disputes</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">No disputes have been filed</p>
          </div>
        </div>

        <div v-for="d in filtered" :key="d.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[140px]"><span class="font-mono text-[13px] font-medium text-foreground truncate block" :title="d.id">{{ d.id.slice(0, 10) }}…</span></div>
          <div class="w-[160px]"><span class="font-sans text-[13px] text-foreground">{{ d.parties }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-foreground">{{ d.reason }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[d.priorityBg, d.priorityText]">{{ d.priority }}</span>
          </div>
          <div class="w-[100px]">
            <UiStatusPill :status="d.status" :label="d.status" />
          </div>
          <div class="w-[110px]"><span class="font-sans text-[13px] text-foreground">{{ d.deadline }}</span></div>
          <div class="w-[70px]">
            <NuxtLink :to="`/settings/disputes/${d.id}`">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">gavel</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No disputes</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">No disputes have been filed</p>
          </div>
        </div>
        <div v-for="d in filtered" :key="d.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-mono text-[13px] font-medium text-foreground truncate block" :title="d.id">{{ d.id.slice(0, 10) }}…</span>
            <UiStatusPill :status="d.status" :label="d.status" />
          </div>
          <span class="font-sans text-sm text-foreground block mb-1">{{ d.reason }}</span>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ d.parties }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[d.priorityBg, d.priorityText]">{{ d.priority }}</span>
            <span>{{ d.deadline }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalDisputes }} disputes</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(-1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <span class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">{{ currentPage }}</span>
          <button @click="goPage(1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>

    <!-- New Dispute Modal -->
    <OpsNewDisputeModal v-model="showNewDispute" />
  </div>
</template>
