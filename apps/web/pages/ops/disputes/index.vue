<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Disputes Queue — RentCred Ops' })

const { getDisputes } = useDisputes()

const showDetail = ref(false)
const selectedDispute = ref<any>(null)
const disputes = ref<any[]>([])
const pagination = ref<any>({})
const loading = ref(true)
const activeStatus = ref('all')

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const searchQuery = ref('')

const kpis = computed(() => {
  const all = disputes.value
  const open = all.filter(d => d.status === 'open').length
  const resolved = all.filter(d => ['resolved', 'closed'].includes(d.status)).length
  return [
    { label: 'TOTAL DISPUTES', value: String(pagination.value.total || all.length), valueColor: 'text-foreground' },
    { label: 'OPEN', value: String(open), valueColor: 'text-[#804200]' },
    { label: 'RESOLVED', value: String(resolved), valueColor: 'text-[#004D1A]' },
    { label: 'UNDER REVIEW', value: String(all.filter(d => d.status === 'under_review').length), valueColor: 'text-blue-600' },
  ]
})

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'resolved': case 'closed': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'under_review': return 'bg-blue-50 text-blue-600'
    default: return 'bg-[#E9E3D8] text-[#804200]'
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function openDetail(dispute: any) {
  selectedDispute.value = dispute
  showDetail.value = true
}

async function loadDisputes() {
  loading.value = true
  try {
    const result = await getDisputes({
      status: activeStatus.value !== 'all' ? activeStatus.value : undefined,
      limit: 50,
    })
    disputes.value = result.data || []
    pagination.value = result.pagination || {}
  } catch {
    // Handle error
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  if (!searchQuery.value) return disputes.value
  const q = searchQuery.value.toLowerCase()
  return disputes.value.filter(d =>
    d.reason?.toLowerCase().includes(q) ||
    d.raisedBy?.name?.toLowerCase().includes(q) ||
    d.submission?.tenantName?.toLowerCase().includes(q) ||
    d.submission?.propertyAddress?.toLowerCase().includes(q)
  )
})

watch(activeStatus, () => loadDisputes())

onMounted(loadDisputes)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Disputes Queue</h1>
        <span class="font-sans text-sm text-muted-foreground">Manage dispute cases and resolutions</span>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono text-[28px] font-bold" :class="kpi.valueColor">{{ kpi.value }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div class="flex gap-1 overflow-x-auto">
        <button
          v-for="tab in statusTabs" :key="tab.value"
          class="px-3 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-colors whitespace-nowrap"
          :class="activeStatus === tab.value ? 'bg-foreground text-white' : 'bg-[#E7E8E5] text-muted-foreground hover:text-foreground'"
          @click="activeStatus = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search disputes..."
        class="w-full sm:w-[200px] h-[36px] px-3 bg-background border border-border rounded-lg text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
      />
    </div>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-semibold text-foreground">Dispute Log</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ filtered.length }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RAISED BY</span></div>
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">SUBMISSION</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">REASON</span></div>
          <div class="w-[110px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">STATUS</span></div>
          <div class="w-[110px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">DATE</span></div>
          <div class="w-[60px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">ACTION</span></div>
        </div>

        <div v-for="d in filtered" :key="d.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[140px] flex flex-col gap-0.5">
            <span class="font-sans text-[13px] font-medium text-foreground">{{ d.raisedBy?.name }}</span>
            <span class="font-sans text-[11px] text-muted-foreground capitalize">{{ d.raisedBy?.role?.replace('_', ' ') }}</span>
          </div>
          <div class="w-[160px] flex flex-col gap-0.5">
            <span class="font-sans text-[13px] text-foreground truncate">{{ d.submission?.tenantName }}</span>
            <span class="font-sans text-[11px] text-muted-foreground truncate">{{ d.submission?.propertyAddress }}</span>
          </div>
          <div class="flex-1 pr-3"><span class="font-sans text-[13px] text-foreground">{{ d.reason }}</span></div>
          <div class="w-[110px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClasses(d.status)">{{ statusLabel(d.status) }}</span>
          </div>
          <div class="w-[110px]"><span class="font-sans text-[12px] text-muted-foreground">{{ new Date(d.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) }}</span></div>
          <div class="w-[60px]">
            <button @click="openDetail(d)" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</button>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-for="d in filtered" :key="d.id" class="px-4 py-3.5 border-b border-border last:border-0" @click="openDetail(d)">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-sans text-[13px] font-medium text-foreground">{{ d.raisedBy?.name }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="statusBadgeClasses(d.status)">{{ statusLabel(d.status) }}</span>
          </div>
          <span class="font-sans text-sm text-foreground block mb-1">{{ d.reason }}</span>
          <span class="font-sans text-[12px] text-muted-foreground">{{ d.submission?.tenantName }} &bull; {{ new Date(d.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) }}</span>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!loading && filtered.length === 0" class="px-6 py-12 text-center">
        <span class="material-symbols-rounded text-[40px] text-muted-foreground">gavel</span>
        <p class="font-sans text-sm text-muted-foreground mt-2">No disputes found</p>
      </div>
    </div>

    <!-- Detail Modal -->
    <OpsDisputeDetailModal v-model="showDetail" :dispute="selectedDispute" @resolved="loadDisputes" />
  </div>
</template>
