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
  active: { bg: 'bg-st-green-bg', text: 'text-st-green-text' },
  inactive: { bg: 'bg-background', text: 'text-muted-foreground' },
  suspended: { bg: 'bg-st-red-bg', text: 'text-st-red-text' },
}

const kpis = ref([
  { label: 'TOTAL AGENTS', value: '—', sub: '', valueColor: 'text-foreground' },
  { label: 'ACTIVE TODAY', value: '—', sub: '', valueColor: 'text-st-green-text' },
  { label: 'AVG RATING', value: '—', sub: '', valueColor: 'text-primary' },
  { label: 'PENDING REVIEWS', value: '—', sub: '', valueColor: 'text-st-amber-text' },
])

const agents = ref<any[]>([])
const totalAgents = ref(0)
const loading = ref(true)
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(totalAgents.value / 20)))

function goPage(dir: number) {
  const next = currentPage.value + dir
  if (next < 1 || next > totalPages.value) return
  currentPage.value = next
  fetchAgents()
}

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
      // Determine status from verification and assignment activity
      const agentStatus = a.isVerified ? 'active' : 'inactive'
      const statusLabel = agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)
      const style = statusStyleMap[agentStatus] ?? statusStyleMap.active
      return {
        id: a.id,
        name: a.name ?? '',
        phone: a.phone ?? '',
        location: '',
        cases: a.activeAssignments ?? 0,
        rating: 0,
        status: statusLabel,
        statusBg: style.bg,
        statusText: style.text,
        lastActive: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
      }
    })

    // Derive KPIs
    const activeCount = items.filter((a: any) => a.isVerified).length
    const totalActive = items.reduce((sum: number, a: any) => sum + (a.activeAssignments ?? 0), 0)
    kpis.value = [
      { label: 'TOTAL AGENTS', value: String(totalAgents.value), sub: '', valueColor: 'text-foreground' },
      { label: 'VERIFIED', value: String(activeCount), sub: '', valueColor: 'text-st-green-text' },
      { label: 'ACTIVE CASES', value: String(totalActive), sub: '', valueColor: 'text-primary' },
      { label: 'PENDING REVIEWS', value: '—', sub: '', valueColor: 'text-st-amber-text' },
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
    <button @click="showAddAgent = true" class="lg:hidden fixed bottom-24 right-5 z-30 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity" aria-label="Add">
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

        <!-- Empty State -->
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">badge</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No field agents</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Field agents will appear here once added to the system</p>
          </div>
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
            <UiStatusPill :status="a.status" :label="a.status" />
          </div>
          <div class="w-[100px]"><span class="font-sans text-[13px] text-muted-foreground">{{ a.lastActive }}</span></div>
          <div class="flex-1">
            <span @click="openAgentDetail(a.id)" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">badge</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No field agents</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Field agents will appear here once added to the system</p>
          </div>
        </div>
        <div v-for="a in filtered" :key="a.name" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-sans text-sm font-medium text-foreground">{{ a.name }}</span>
            <UiStatusPill :status="a.status" :label="a.status" />
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
          <button @click="goPage(-1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-card border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <span class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-background">{{ currentPage }}</span>
          <button @click="goPage(1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
    <!-- Add Agent Modal -->
    <OpsAddAgentModal v-model="showAddAgent" />

    <!-- Agent Detail Modal -->
    <OpsAgentDetailModal v-model="showAgentDetail" :agent-id="selectedAgentId" />
  </div>
</template>
