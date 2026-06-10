<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Cases Management — RentCred Ops' })

const { getSubmissions } = useSubmissions()

const showReassign = ref(false)
const reassignSubmissionId = ref<string | null>(null)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Field Visit', value: 'Field Visit' },
  { label: 'Pending Review', value: 'Pending Review' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Rejected', value: 'Rejected' },
]

const statusStyleMap: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  in_progress: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  field_visit: { bg: 'bg-blue-50', text: 'text-blue-600' },
  report_building: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
  rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
}

const kpis = ref([
  { label: 'TOTAL CASES', value: '—', sub: '', valueColor: 'text-foreground' },
  { label: 'IN PROGRESS', value: '—', sub: '', valueColor: 'text-primary' },
  { label: 'PENDING ASSIGNMENT', value: '—', sub: '', valueColor: 'text-[#804200]' },
  { label: 'COMPLETED THIS WEEK', value: '—', sub: '', valueColor: 'text-[#004D1A]' },
])

const cases = ref<any[]>([])
const totalCases = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(true)

async function fetchCases(page = 1) {
  loading.value = true
  try {
    const res = await getSubmissions({ page, limit: 20 })
    const items = res.data ?? []
    const pagination = res.pagination ?? {}

    totalCases.value = pagination.total ?? items.length
    currentPage.value = pagination.page ?? page
    totalPages.value = pagination.totalPages ?? 1

    cases.value = items.map((s: any) => {
      const style = statusStyleMap[s.status] ?? { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' }
      return {
        id: s.id,
        tenant: s.tenantName,
        agent: s.agent?.name ?? '—',
        status: SUBMISSION_STATUS_LABELS[s.status] ?? s.status,
        rawStatus: s.status,
        statusBg: style.bg,
        statusText: style.text,
        assigned: s.fieldAssignments?.[0]?.fieldAgent?.name ?? '—',
        updated: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
      }
    })

    // Derive KPIs from data
    const inProgress = items.filter((s: any) => s.status === 'in_progress').length
    const pending = items.filter((s: any) => s.status === 'pending').length
    const completed = items.filter((s: any) => s.status === 'completed').length
    kpis.value = [
      { label: 'TOTAL CASES', value: String(totalCases.value), sub: '', valueColor: 'text-foreground' },
      { label: 'IN PROGRESS', value: String(inProgress), sub: '', valueColor: 'text-primary' },
      { label: 'PENDING ASSIGNMENT', value: String(pending), sub: '', valueColor: 'text-[#804200]' },
      { label: 'COMPLETED', value: String(completed), sub: '', valueColor: 'text-[#004D1A]' },
    ]
  } catch { /* empty */ }
  finally { loading.value = false }
}

function openReassign(submissionId: string) {
  reassignSubmissionId.value = submissionId
  showReassign.value = true
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchCases(page)
}

onMounted(() => fetchCases())

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: cases,
  searchFields: ['id', 'tenant', 'agent', 'assigned'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Cases Management</h1>
        <span class="font-sans text-sm text-muted-foreground">Track and manage all verification cases</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search cases..." />
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
          <span class="font-mono text-sm font-semibold text-foreground">All Cases</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-x-auto">
        <div class="flex bg-background px-6 py-2.5 border-b border-border min-w-[900px]">
          <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
          <div class="w-[150px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Tenant</span></div>
          <div class="w-[140px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Agent / Business</span></div>
          <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[130px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Assigned To</span></div>
          <div class="w-[90px] flex-shrink-0"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Updated</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <!-- Empty State -->
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">folder_open</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No cases found</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">No verification cases match your filters</p>
          </div>
        </div>

        <div v-for="c in filtered" :key="c.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors min-w-[900px]">
          <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[12px] font-medium text-foreground truncate block" :title="c.id">{{ c.id.slice(0, 10) }}…</span></div>
          <div class="w-[150px] flex-shrink-0"><span class="font-sans text-[13px] text-foreground truncate block">{{ c.tenant }}</span></div>
          <div class="w-[140px] flex-shrink-0"><span class="font-sans text-[13px] text-foreground truncate block">{{ c.agent }}</span></div>
          <div class="w-[120px] flex-shrink-0">
            <UiStatusPill :status="c.rawStatus" :label="c.status" />
          </div>
          <div class="w-[130px] flex-shrink-0"><span class="font-sans text-[13px] text-foreground truncate block">{{ c.assigned }}</span></div>
          <div class="w-[90px] flex-shrink-0"><span class="font-sans text-[13px] text-muted-foreground">{{ c.updated }}</span></div>
          <div class="flex-1 flex items-center gap-1">
            <NuxtLink :to="`/ops/cases/${c.id}`" class="flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg hover:bg-surface transition-colors" title="View"><span class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground">visibility</span></NuxtLink>
            <button @click="openReassign(c.id)" class="flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg hover:bg-surface transition-colors" :title="c.assigned === '—' ? 'Assign' : 'Reassign'"><span class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground">{{ c.assigned === '—' ? 'person_add' : 'swap_horiz' }}</span></button>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-if="filtered.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">folder_open</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No cases found</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">No verification cases match your filters</p>
          </div>
        </div>
        <div v-for="c in filtered" :key="c.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[13px] font-medium text-foreground">{{ c.id.slice(0, 10) }}…</span>
            </div>
            <UiStatusPill :status="c.rawStatus" :label="c.status" />
          </div>
          <span class="font-sans text-sm text-foreground block mb-1">{{ c.tenant }}</span>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ c.agent }}</span>
            <span>{{ c.assigned }}</span>
            <span>{{ c.updated }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalCases }} cases</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <template v-for="p in totalPages" :key="p">
            <button @click="goPage(p)" class="px-2.5 py-1 rounded-md text-[12px] font-sans" :class="p === currentPage ? 'bg-foreground text-white' : 'bg-white border border-border text-foreground'">{{ p }}</button>
          </template>
          <button @click="goPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>

    <!-- Case Reassign Modal -->
    <OpsCaseReassignModal v-model="showReassign" :submission-id="reassignSubmissionId" @reassigned="fetchCases(currentPage)" />
  </div>
</template>
