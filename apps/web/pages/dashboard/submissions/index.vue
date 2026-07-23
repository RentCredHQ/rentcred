<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'My Submissions — RentCred' })

const { getSubmissions } = useSubmissions()

const showShare = ref(false)
const shareTarget = ref('')

function openShare(reportId: string) {
  shareTarget.value = reportId
  showShare.value = true
}
const loading = ref(true)
const totalCount = ref(0)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Pending Review', value: 'Pending Review' },
  { label: 'Completed', value: 'Completed' },
]

const submissions = ref<any[]>([])

const mappedSubmissions = computed(() =>
  submissions.value.map((s: any) => {
    const label = SUBMISSION_STATUS_LABELS[s.status] || s.status
    return {
      name: s.tenantName,
      caseId: s.id,
      // Sharing targets the report; only approved reports can be shared.
      shareableReportId: s.report?.status === 'approved' ? s.report.id : '',
      package: s.propertyType || 'Standard',
      rawStatus: s.status,
      status: label,
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  })
)

const summaryCards = computed(() => {
  const total = totalCount.value
  const inProgress = submissions.value.filter((s: any) => ['in_progress', 'field_visit'].includes(s.status)).length
  const needsAttention = submissions.value.filter((s: any) => ['pending', 'rejected'].includes(s.status)).length
  const completed = submissions.value.filter((s: any) => s.status === 'completed').length
  return [
    { label: 'Total Submissions', value: String(total), valueColor: 'text-foreground' },
    { label: 'In Progress', value: String(inProgress), valueColor: 'text-primary' },
    { label: 'Needs Attention', value: String(needsAttention), valueColor: 'text-st-amber-text' },
    { label: 'Completed', value: String(completed), valueColor: 'text-st-green-text' },
  ]
})

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: mappedSubmissions,
  searchFields: ['name', 'caseId'],
  statusField: 'status',
})

onMounted(async () => {
  try {
    const res = await getSubmissions()
    submissions.value = res.data ?? []
    totalCount.value = res.pagination?.total ?? submissions.value.length
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="flex items-center gap-3">
      <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">My Submissions</h1>
      <span class="px-2.5 py-1 rounded-full bg-surface font-sans text-[12px] font-medium text-foreground">{{ resultCount }} active</span>
    </div>

    <!-- Search & Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by tenant name or case ID..." width="w-full sm:w-[280px]" />
    </UiFilterBar>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="card in summaryCards" :key="card.label" class="bg-card border border-border rounded-lg px-3.5 py-3 flex flex-col gap-1">
        <span class="font-sans text-[12px] text-muted-foreground">{{ card.label }}</span>
        <span class="font-mono text-xl font-bold" :class="card.valueColor">{{ card.value }}</span>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="hidden lg:flex items-center justify-between py-2">
      <span class="font-sans text-[12px] font-medium text-muted-foreground">3 selected</span>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 bg-foreground rounded-lg font-mono text-[12px] font-semibold text-background hover:opacity-90 transition-opacity">Export</button>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden lg:block bg-card border-[1.5px] border-border rounded-lg overflow-hidden">
      <!-- Column Headers -->
      <div class="flex bg-surface px-4 py-3 min-w-[860px]">
        <div class="w-[180px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Tenant Name</span></div>
        <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
        <div class="w-[130px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Package</span></div>
        <div class="w-[140px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
        <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Submitted</span></div>
        <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Actions</span></div>
      </div>

      <!-- Empty State -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">folder_open</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <h3 class="font-mono text-base font-semibold text-foreground">No submissions</h3>
          <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">You haven't submitted any tenants yet</p>
        </div>
      </div>

      <!-- Rows -->
      <NuxtLink
        v-for="sub in filtered"
        :key="sub.caseId"
        :to="`/dashboard/submissions/${sub.caseId}`"
        class="flex items-center px-4 py-3.5 border-b border-border hover:bg-surface/30 transition-colors cursor-pointer min-w-[860px]"
      >
        <div class="w-[180px] flex-shrink-0"><span class="font-sans text-sm font-medium text-foreground truncate block">{{ sub.name }}</span></div>
        <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[13px] text-muted-foreground truncate block" :title="sub.caseId">{{ sub.caseId?.slice(0, 10) }}…</span></div>
        <div class="w-[130px] flex-shrink-0"><span class="font-sans text-sm text-foreground">{{ sub.package }}</span></div>
        <div class="w-[140px] flex-shrink-0">
          <UiStatusPill :status="sub.rawStatus" :label="sub.status" />
        </div>
        <div class="w-[120px] flex-shrink-0"><span class="font-sans text-[13px] text-muted-foreground">{{ sub.date }}</span></div>
        <div class="flex-1 flex items-center gap-2" @click.prevent.stop>
          <NuxtLink :to="`/dashboard/submissions/${sub.caseId}`" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</NuxtLink>
          <button
            v-if="sub.shareableReportId"
            @click="openShare(sub.shareableReportId)"
            class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer"
          >share</button>
          <button class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">more_vert</button>
        </div>
      </NuxtLink>

      <!-- Footer -->
      <div v-if="filtered.length > 0" class="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalCount }} submissions</span>
      </div>
    </div>

    <!-- Mobile Card List -->
    <div class="lg:hidden flex flex-col gap-3">
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">folder_open</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <h3 class="font-mono text-base font-semibold text-foreground">No submissions</h3>
          <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">You haven't submitted any tenants yet</p>
        </div>
      </div>
      <NuxtLink
        v-for="sub in filtered"
        :key="sub.caseId"
        :to="`/dashboard/submissions/${sub.caseId}`"
        class="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-semibold text-foreground">{{ sub.name }}</span>
          <UiStatusPill :status="sub.rawStatus" :label="sub.status" />
        </div>
        <div class="flex items-center gap-4 text-[12px] text-muted-foreground font-sans">
          <span class="font-mono">{{ sub.caseId?.slice(0, 10) }}…</span>
          <span>{{ sub.package }}</span>
          <span>{{ sub.date }}</span>
        </div>
      </NuxtLink>
    </div>
    <DashboardShareReportModal v-model="showShare" :report-id="shareTarget" />
    </template>
  </div>
</template>
