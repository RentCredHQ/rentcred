<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Reports — RentCred Ops' })

const { api } = useApi()

const showApproval = ref(false)
const selectedReportId = ref<string | null>(null)
const loading = ref(true)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending Approval', value: 'Pending Approval' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
]

const statusStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-background', text: 'text-muted-foreground', label: 'Draft' },
  pending_approval: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]', label: 'Pending Approval' },
  approved: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]', label: 'Approved' },
  rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]', label: 'Rejected' },
}

const kpis = ref([
  { label: 'TOTAL REPORTS', value: '—', sub: '', valueColor: 'text-foreground' },
  { label: 'PENDING REVIEW', value: '—', sub: '', valueColor: 'text-primary' },
  { label: 'APPROVED', value: '—', sub: '', valueColor: 'text-[#004D1A]' },
  { label: 'REJECTED', value: '—', sub: '', valueColor: 'text-[#8C1C00]' },
])

const reports = ref<any[]>([])
const totalReports = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

async function fetchReports(page = 1) {
  loading.value = true
  try {
    const res = await api<any>('/reports', { params: { page, limit: 20 } })
    const items = res.data ?? []
    const pagination = res.pagination ?? {}

    totalReports.value = pagination.total ?? items.length
    currentPage.value = pagination.page ?? page
    totalPages.value = pagination.totalPages ?? 1

    reports.value = items.map((r: any) => {
      const style = statusStyleMap[r.status] ?? statusStyleMap.draft
      return {
        id: r.id,
        caseId: r.submission?.id ?? r.submissionId ?? '',
        tenant: r.submission?.tenantName ?? '',
        agent: r.submission?.agent?.name ?? '',
        risk: '—',
        riskBg: 'bg-[#E7E8E5]',
        riskText: 'text-foreground',
        status: style.label,
        statusBg: style.bg,
        statusText: style.text,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
      }
    })

    // Derive KPIs
    const pendingCount = items.filter((r: any) => ['draft', 'pending_approval'].includes(r.status)).length
    const approvedCount = items.filter((r: any) => r.status === 'approved').length
    const rejectedCount = items.filter((r: any) => r.status === 'rejected').length
    kpis.value = [
      { label: 'TOTAL REPORTS', value: String(totalReports.value), sub: '', valueColor: 'text-foreground' },
      { label: 'PENDING REVIEW', value: String(pendingCount), sub: '', valueColor: 'text-primary' },
      { label: 'APPROVED', value: String(approvedCount), sub: '', valueColor: 'text-[#004D1A]' },
      { label: 'REJECTED', value: String(rejectedCount), sub: '', valueColor: 'text-[#8C1C00]' },
    ]
  } catch { /* empty */ }
  finally { loading.value = false }
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchReports(page)
}

onMounted(() => fetchReports())

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: reports,
  searchFields: ['id', 'caseId', 'tenant', 'agent'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Reports</h1>
        <span class="font-sans text-sm text-muted-foreground">Review and approve verification reports</span>
      </div>
    </div>

    <!-- Tabs & Search -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search reports..." />
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono text-[28px] font-bold" :class="kpi.valueColor">{{ kpi.value }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-semibold text-foreground">Verification Reports</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-x-auto">
        <div class="flex bg-background px-6 py-2.5 border-b border-border min-w-[900px]">
          <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Report ID</span></div>
          <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
          <div class="w-[150px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Tenant</span></div>
          <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Field Agent</span></div>
          <div class="w-[90px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Risk Level</span></div>
          <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[80px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Date</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <!-- Empty State -->
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">assessment</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No reports</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Reports will appear here as verifications complete</p>
          </div>
        </div>

        <div v-for="rpt in filtered" :key="rpt.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors min-w-[900px]">
          <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[12px] font-medium text-foreground truncate block" :title="rpt.id">{{ rpt.id.slice(0, 10) }}…</span></div>
          <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[12px] text-muted-foreground truncate block" :title="rpt.caseId">{{ rpt.caseId?.slice(0, 10) }}…</span></div>
          <div class="w-[150px] flex-shrink-0"><span class="font-sans text-[13px] text-foreground truncate block">{{ rpt.tenant }}</span></div>
          <div class="w-[120px] flex-shrink-0"><span class="font-sans text-[13px] text-foreground truncate block">{{ rpt.agent }}</span></div>
          <div class="w-[90px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[rpt.riskBg, rpt.riskText]">{{ rpt.risk }}</span>
          </div>
          <div class="w-[120px]">
            <UiStatusPill :status="rpt.status" :label="rpt.status" />
          </div>
          <div class="w-[80px]"><span class="font-sans text-[13px] text-foreground">{{ rpt.date }}</span></div>
          <div class="flex-1">
            <span @click="selectedReportId = rpt.id; showApproval = true" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">assessment</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No reports</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Reports will appear here as verifications complete</p>
          </div>
        </div>
        <div v-for="rpt in filtered" :key="rpt.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[13px] font-medium text-foreground">{{ rpt.id.slice(0, 10) }}…</span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[rpt.riskBg, rpt.riskText]">{{ rpt.risk }}</span>
            </div>
            <UiStatusPill :status="rpt.status" :label="rpt.status" />
          </div>
          <span class="font-sans text-sm text-foreground block mb-1">{{ rpt.tenant }}</span>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ rpt.agent }}</span>
            <span class="font-mono">{{ rpt.caseId }}</span>
            <span>{{ rpt.date }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalReports }} reports</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <template v-for="p in totalPages" :key="p">
            <button @click="goPage(p)" class="px-2.5 py-1 rounded-md text-[12px] font-sans" :class="p === currentPage ? 'bg-foreground text-white' : 'bg-white border border-border text-foreground'">{{ p }}</button>
          </template>
          <button @click="goPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
    <!-- Report Approval Modal -->
    <OpsReportApprovalModal v-model="showApproval" :report-id="selectedReportId" @reviewed="fetchReports()" />
  </div>
</template>
