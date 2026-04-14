<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Field Agents — RentCred Ops' })

const { api } = useApi()

const showAddAgent = ref(false)
const showAgentDetail = ref(false)
const selectedAgentId = ref<string | null>(null)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Suspended', value: 'Suspended' },
]

const statusStyleMap: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
  inactive: { bg: 'bg-background', text: 'text-muted-foreground' },
  suspended: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
}

const kpis = ref([
  { label: 'TOTAL AGENTS', value: '—', sub: '', valueColor: 'text-foreground' },
  { label: 'ACTIVE TODAY', value: '—', sub: '', valueColor: 'text-[#004D1A]' },
  { label: 'AVG RATING', value: '—', sub: '', valueColor: 'text-primary' },
  { label: 'PENDING REVIEWS', value: '—', sub: '', valueColor: 'text-[#804200]' },
])

const agents = ref<any[]>([])
const totalAgents = ref(0)
const loading = ref(true)

function openAgentDetail(agentId: string) {
  selectedAgentId.value = agentId
  showAgentDetail.value = true
}

async function fetchAgents() {
  loading.value = true
  try {
    const res = await api<any>('/field-agents')
    const items = res.data ?? res ?? []

    totalAgents.value = items.length

    agents.value = items.map((a: any) => {
      const statusLabel = (a.status ?? 'active').charAt(0).toUpperCase() + (a.status ?? 'active').slice(1)
      const style = statusStyleMap[a.status ?? 'active'] ?? statusStyleMap.active
      return {
        id: a.id,
        name: a.name ?? '',
        phone: a.phone ?? '',
        location: a.location ?? a.state ?? '',
        cases: a.activeCases ?? a.caseCount ?? 0,
        rating: a.rating ?? 0,
        status: statusLabel,
        statusBg: style.bg,
        statusText: style.text,
        lastActive: a.lastActiveAt ? new Date(a.lastActiveAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
      }
    })

    // Derive KPIs
    const activeCount = items.filter((a: any) => a.status === 'active').length
    const ratings = items.filter((a: any) => a.rating).map((a: any) => a.rating)
    const avgRating = ratings.length ? (ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length).toFixed(1) : '—'
    kpis.value = [
      { label: 'TOTAL AGENTS', value: String(totalAgents.value), sub: '', valueColor: 'text-foreground' },
      { label: 'ACTIVE TODAY', value: String(activeCount), sub: '', valueColor: 'text-[#004D1A]' },
      { label: 'AVG RATING', value: String(avgRating), sub: '', valueColor: 'text-primary' },
      { label: 'PENDING REVIEWS', value: '—', sub: '', valueColor: 'text-[#804200]' },
    ]
  } catch { /* empty */ }
  finally { loading.value = false }
}

onMounted(() => fetchAgents())

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: agents,
  searchFields: ['name', 'phone', 'location'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Field Agents</h1>
        <span class="font-sans text-sm text-muted-foreground">Manage and monitor verification field agents</span>
      </div>
      <div class="flex items-center gap-3">
        <button @click="showAddAgent = true" class="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
          <span class="material-symbols-rounded text-[16px]">add</span>
          Add Agent
        </button>
      </div>
    </div>

    <!-- Mobile Add Agent FAB -->
    <button @click="showAddAgent = true" class="lg:hidden fixed bottom-24 right-5 z-30 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
      <span class="material-symbols-rounded text-[24px]">add</span>
    </button>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono text-[28px] font-bold" :class="kpi.valueColor">{{ kpi.value }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search agents..." />
    </UiFilterBar>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-semibold text-foreground">All Agents</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Agent Name</span></div>
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Phone</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Location</span></div>
          <div class="w-[90px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Cases</span></div>
          <div class="w-[90px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Rating</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Last Active</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <div v-for="a in filtered" :key="a.name" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[160px]"><span class="font-sans text-[13px] font-medium text-foreground">{{ a.name }}</span></div>
          <div class="w-[140px]"><span class="font-sans text-[13px] text-muted-foreground">{{ a.phone }}</span></div>
          <div class="w-[100px]"><span class="font-sans text-[13px] text-foreground">{{ a.location }}</span></div>
          <div class="w-[90px]"><span class="font-mono text-[13px] text-foreground">{{ a.cases }}</span></div>
          <div class="w-[90px]">
            <div class="flex items-center gap-1">
              <span class="material-symbols-rounded text-[14px] text-primary">star</span>
              <span class="font-mono text-[13px] text-foreground">{{ a.rating }}</span>
            </div>
          </div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[a.statusBg, a.statusText]">{{ a.status }}</span>
          </div>
          <div class="w-[100px]"><span class="font-sans text-[13px] text-muted-foreground">{{ a.lastActive }}</span></div>
          <div class="flex-1">
            <span @click="openAgentDetail(a.id)" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-for="a in filtered" :key="a.name" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-sans text-sm font-medium text-foreground">{{ a.name }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[a.statusBg, a.statusText]">{{ a.status }}</span>
          </div>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ a.location }}</span>
            <span>{{ a.cases }} cases</span>
            <div class="flex items-center gap-0.5">
              <span class="material-symbols-rounded text-[12px] text-primary">star</span>
              <span>{{ a.rating }}</span>
            </div>
            <span>{{ a.lastActive }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalAgents }} agents</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">2</button>
          <button class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white">Next</button>
        </div>
      </div>
    </div>
    <!-- Add Agent Modal -->
    <OpsAddAgentModal v-model="showAddAgent" />

    <!-- Agent Detail Modal -->
    <OpsAgentDetailModal v-model="showAgentDetail" :agent-id="selectedAgentId" />
  </div>
</template>
