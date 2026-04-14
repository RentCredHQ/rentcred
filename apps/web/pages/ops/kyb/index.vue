<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'KYB Approval Queue — RentCred Ops' })

const { getKybApplications, reviewKyb } = useKyb()

const showReview = ref(false)
const selectedAppId = ref<string | null>(null)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
]
const showConfirm = ref(false)
const confirmAction = ref<'approve' | 'reject'>('approve')
const selectedConfirmId = ref<string | null>(null)
const confirmLoading = ref(false)

const statusStyleMap: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  submitted: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  under_review: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  approved: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
  rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
}

function openReview(id: string) {
  selectedAppId.value = id
  showReview.value = true
}

function openConfirm(id: string, action: 'approve' | 'reject') {
  selectedConfirmId.value = id
  confirmAction.value = action
  showConfirm.value = true
}

async function executeConfirm() {
  if (!selectedConfirmId.value) return
  confirmLoading.value = true
  try {
    await reviewKyb(selectedConfirmId.value, { status: confirmAction.value === 'approve' ? 'approved' : 'rejected' })
    showConfirm.value = false
    await fetchApplications()
  } catch { /* empty */ }
  finally { confirmLoading.value = false }
}

const kpis = ref([
  { label: 'TOTAL APPLICATIONS', value: '—', sub: '', valueColor: 'text-foreground' },
  { label: 'PENDING REVIEW', value: '—', sub: '', valueColor: 'text-primary' },
  { label: 'APPROVED', value: '—', sub: '', valueColor: 'text-[#004D1A]' },
  { label: 'REJECTED', value: '—', sub: '', valueColor: 'text-[#8C1C00]' },
])

const applications = ref<any[]>([])
const totalApps = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(true)

async function fetchApplications(page = 1) {
  loading.value = true
  try {
    const res = await getKybApplications({ page, limit: 20 })
    const items = res.data ?? []
    const pagination = res.pagination ?? {}

    totalApps.value = pagination.total ?? items.length
    currentPage.value = pagination.page ?? page
    totalPages.value = pagination.totalPages ?? 1

    const statusLabelMap: Record<string, string> = {
      pending: 'Pending', submitted: 'Pending', under_review: 'Pending',
      approved: 'Approved', rejected: 'Rejected',
    }

    applications.value = items.map((app: any) => {
      const label = statusLabelMap[app.status] ?? app.status
      const style = statusStyleMap[app.status] ?? { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' }
      return {
        id: app.id,
        business: app.businessName ?? app.business ?? '',
        email: app.email ?? '',
        agent: app.agentName ?? app.agent?.name ?? '',
        rc: app.rcNumber ?? '',
        status: label,
        statusBg: style.bg,
        statusText: style.text,
        date: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
        canAction: ['pending', 'submitted', 'under_review'].includes(app.status),
      }
    })

    // Derive KPIs
    const pendingCount = items.filter((a: any) => ['pending', 'submitted', 'under_review'].includes(a.status)).length
    const approvedCount = items.filter((a: any) => a.status === 'approved').length
    const rejectedCount = items.filter((a: any) => a.status === 'rejected').length
    kpis.value = [
      { label: 'TOTAL APPLICATIONS', value: String(totalApps.value), sub: '', valueColor: 'text-foreground' },
      { label: 'PENDING REVIEW', value: String(pendingCount), sub: '', valueColor: 'text-primary' },
      { label: 'APPROVED', value: String(approvedCount), sub: '', valueColor: 'text-[#004D1A]' },
      { label: 'REJECTED', value: String(rejectedCount), sub: '', valueColor: 'text-[#8C1C00]' },
    ]
  } catch { /* empty */ }
  finally { loading.value = false }
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchApplications(page)
}

onMounted(() => fetchApplications())

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: applications,
  searchFields: ['business', 'agent', 'rc', 'email'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">KYB Approval Queue</h1>
        <span class="font-sans text-sm text-muted-foreground">Review and approve agent business verifications</span>
      </div>
    </div>

    <!-- Tabs & Search -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search businesses..." />
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
          <span class="font-mono text-sm font-semibold text-foreground">KYB Applications</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[180px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Business Name</span></div>
          <div class="w-[130px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Agent</span></div>
          <div class="w-[110px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RC Number</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Submitted</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Actions</span></div>
        </div>

        <div v-for="app in filtered" :key="app.rc" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[180px]">
            <span class="font-sans text-[13px] font-medium text-foreground block">{{ app.business }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ app.email }}</span>
          </div>
          <div class="w-[130px]"><span class="font-sans text-[13px] text-foreground">{{ app.agent }}</span></div>
          <div class="w-[110px]"><span class="font-mono text-[12px] text-foreground">{{ app.rc }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[app.statusBg, app.statusText]">{{ app.status }}</span>
          </div>
          <div class="w-[100px]"><span class="font-sans text-[13px] text-foreground">{{ app.date }}</span></div>
          <div class="flex-1 flex items-center gap-2">
            <span @click="openReview(app.id)" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
            <template v-if="app.canAction">
              <span @click="openConfirm(app.id, 'approve')" class="material-symbols-rounded text-[18px] text-[#004D1A] hover:opacity-70 cursor-pointer">check_circle</span>
              <span @click="openConfirm(app.id, 'reject')" class="material-symbols-rounded text-[18px] text-[#8C1C00] hover:opacity-70 cursor-pointer">cancel</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-for="app in filtered" :key="app.rc" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-sans text-sm font-medium text-foreground">{{ app.business }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[app.statusBg, app.statusText]">{{ app.status }}</span>
          </div>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ app.agent }}</span>
            <span class="font-mono">{{ app.rc }}</span>
            <span>{{ app.date }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalApps }} applications</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <template v-for="p in totalPages" :key="p">
            <button @click="goPage(p)" class="px-2.5 py-1 rounded-md text-[12px] font-sans" :class="p === currentPage ? 'bg-foreground text-white' : 'bg-white border border-border text-foreground'">{{ p }}</button>
          </template>
          <button @click="goPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>

    <!-- KYB Review Modal -->
    <OpsKybReviewModal v-model="showReview" :application-id="selectedAppId" @reviewed="fetchApplications(currentPage)" />

    <!-- Confirm Action Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showConfirm = false" />
          <div class="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-sm p-6">
            <h3 class="font-mono text-base font-semibold text-foreground mb-2">
              {{ confirmAction === 'approve' ? 'Approve Application' : 'Reject Application' }}
            </h3>
            <p class="font-sans text-sm text-muted-foreground mb-6">
              {{ confirmAction === 'approve'
                ? 'Are you sure you want to approve this KYB application? The agent will be notified.'
                : 'Are you sure you want to reject this KYB application? The agent will need to resubmit.' }}
            </p>
            <div class="flex items-center gap-3 justify-end">
              <button @click="showConfirm = false" class="px-4 py-2 border border-border rounded-lg text-sm font-sans text-foreground hover:bg-surface transition-colors">Cancel</button>
              <button
                @click="executeConfirm"
                class="px-4 py-2 rounded-lg text-sm font-mono font-semibold text-white transition-opacity hover:opacity-90"
                :class="confirmAction === 'approve' ? 'bg-[#004D1A]' : 'bg-[#8C1C00]'"
              >
                {{ confirmAction === 'approve' ? 'Approve' : 'Reject' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
