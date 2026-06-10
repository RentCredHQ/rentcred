<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Reports — RentCred' })

const { getReports } = useReports()

const showShare = ref(false)
const shareTarget = ref('')
const loading = ref(true)

function openShare(caseId: string) {
  shareTarget.value = caseId
  showShare.value = true
}

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Ready', value: 'Ready' },
  { label: 'Pending Review', value: 'Pending Review' },
  { label: 'Draft', value: 'Draft' },
]

function getReportStatusLabel(status: string) {
  const map: Record<string, string> = {
    approved: 'Ready',
    pending_approval: 'Pending Review',
    draft: 'Draft',
    rejected: 'Rejected',
  }
  return map[status] || status
}

function getRecStyle(rating: string) {
  const map: Record<string, { label: string; color: string }> = {
    excellent: { label: 'Low Concern', color: 'text-[#004D1A]' },
    good: { label: 'Low Concern', color: 'text-[#004D1A]' },
    fair: { label: 'Medium Concern', color: 'text-[#804200]' },
    poor: { label: 'High Concern', color: 'text-[#8C1C00]' },
    fail: { label: 'High Concern', color: 'text-[#8C1C00]' },
  }
  return map[rating] || { label: 'Unknown', color: 'text-foreground' }
}

const rawReports = ref<any[]>([])

const reports = computed(() =>
  rawReports.value.map((r: any) => {
    const rec = getRecStyle(r.content?.overallRating)
    return {
      tenant: r.submission?.tenantName || r.content?.tenant?.name || r.content?.tenantInfo?.name || '',
      caseId: r.submissionId || r.id,
      rawStatus: r.status,
      status: getReportStatusLabel(r.status),
      recommendation: rec.label,
      recColor: rec.color,
      generated: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  })
)

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: reports,
  searchFields: ['tenant', 'caseId'],
  statusField: 'status',
})

onMounted(async () => {
  try {
    const res = await getReports()
    rawReports.value = res.data ?? []
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
      <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Reports</h1>
      <span class="px-2.5 py-1 rounded-full bg-[#E7E8E5] font-sans text-[12px] font-medium text-foreground">{{ resultCount }} reports</span>
    </div>

    <!-- Search & Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by tenant name or case ID..." width="w-full sm:w-[280px]" />
    </UiFilterBar>

    <!-- Desktop Table -->
    <div class="hidden lg:block bg-white border-[1.5px] border-border rounded-lg overflow-hidden overflow-x-auto">
      <div class="flex bg-[#E7E8E5] px-4 py-3 min-w-[860px]">
        <div class="w-[170px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Tenant Name</span></div>
        <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
        <div class="w-[140px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Report Status</span></div>
        <div class="w-[160px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Recommendation</span></div>
        <div class="w-[110px] flex-shrink-0"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Generated</span></div>
        <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Actions</span></div>
      </div>

      <!-- Empty State -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">assessment</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <h3 class="font-mono text-base font-semibold text-foreground">No reports yet</h3>
          <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Reports will appear here once verifications are complete</p>
        </div>
      </div>

      <NuxtLink v-for="report in filtered" :key="report.caseId" :to="`/dashboard/reports/${report.caseId}`" class="flex items-center px-4 py-3.5 border-b border-border hover:bg-surface/30 transition-colors min-w-[860px] cursor-pointer">
        <div class="w-[170px] flex-shrink-0"><span class="font-sans text-sm font-medium text-foreground truncate block">{{ report.tenant }}</span></div>
        <div class="w-[120px] flex-shrink-0"><span class="font-mono text-[13px] text-muted-foreground truncate block" :title="report.caseId">{{ report.caseId?.slice(0, 10) }}…</span></div>
        <div class="w-[140px]">
          <UiStatusPill :status="report.rawStatus" :label="report.status" />
        </div>
        <div class="w-[160px]"><span class="font-sans text-sm font-medium" :class="report.recColor">{{ report.recommendation }}</span></div>
        <div class="w-[110px]"><span class="font-sans text-[13px] text-muted-foreground">{{ report.generated }}</span></div>
        <div class="flex-1 flex items-center gap-2" @click.stop>
          <NuxtLink :to="`/dashboard/reports/${report.caseId}`" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</NuxtLink>
          <button @click="openShare(report.caseId)" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">share</button>
          <button class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">download</button>
        </div>
      </NuxtLink>
    </div>

    <!-- Mobile Card List -->
    <div class="lg:hidden flex flex-col gap-3">
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">assessment</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <h3 class="font-mono text-base font-semibold text-foreground">No reports yet</h3>
          <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Reports will appear here once verifications are complete</p>
        </div>
      </div>
      <NuxtLink v-for="report in filtered" :key="report.caseId" :to="`/dashboard/reports/${report.caseId}`" class="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:border-primary/40 transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-semibold text-foreground">{{ report.tenant }}</span>
          <UiStatusPill :status="report.rawStatus" :label="report.status" />
        </div>
        <div class="flex items-center justify-between">
          <span class="font-mono text-[12px] text-muted-foreground">{{ report.caseId?.slice(0, 10) }}…</span>
          <span class="font-sans text-[12px] font-medium" :class="report.recColor">{{ report.recommendation }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-sans text-[12px] text-muted-foreground">{{ report.generated }}</span>
          <div class="flex gap-3">
            <NuxtLink :to="`/dashboard/reports/${report.caseId}`" class="material-symbols-rounded text-[18px] text-muted-foreground">visibility</NuxtLink>
            <button @click="openShare(report.caseId)" class="material-symbols-rounded text-[18px] text-muted-foreground">share</button>
          </div>
        </div>
      </NuxtLink>
    </div>
    <DashboardShareReportModal v-model="showShare" />
    </template>
  </div>
</template>
