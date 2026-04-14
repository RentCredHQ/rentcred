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

function getReportStatusStyle(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    approved: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
    pending_approval: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    draft: { bg: 'bg-[#E7E8E5]', text: 'text-foreground' },
    rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
  }
  return map[status] || { bg: 'bg-[#E7E8E5]', text: 'text-foreground' }
}

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
    const style = getReportStatusStyle(r.status)
    const rec = getRecStyle(r.content?.overallRating)
    return {
      tenant: r.content?.tenantInfo?.name || '',
      caseId: r.submissionId || r.id,
      status: getReportStatusLabel(r.status),
      statusBg: style.bg,
      statusText: style.text,
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
      <UiFilterSearch v-model="searchQuery" placeholder="Search by tenant name or case ID..." width="w-[280px]" />
    </UiFilterBar>

    <!-- Desktop Table -->
    <div class="hidden lg:block bg-white border-[1.5px] border-border rounded-lg overflow-hidden">
      <div class="flex bg-[#E7E8E5] px-4 py-3">
        <div class="w-[170px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Tenant Name</span></div>
        <div class="w-[140px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
        <div class="w-[140px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Report Status</span></div>
        <div class="w-[160px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Recommendation</span></div>
        <div class="w-[110px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Generated</span></div>
        <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Actions</span></div>
      </div>

      <div v-for="report in filtered" :key="report.caseId" class="flex items-center px-4 py-3.5 border-b border-border hover:bg-surface/30 transition-colors">
        <div class="w-[170px]"><span class="font-sans text-sm font-medium text-foreground">{{ report.tenant }}</span></div>
        <div class="w-[140px]"><span class="font-mono text-[13px] text-muted-foreground">{{ report.caseId }}</span></div>
        <div class="w-[140px]">
          <span class="inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium" :class="[report.statusBg, report.statusText]">{{ report.status }}</span>
        </div>
        <div class="w-[160px]"><span class="font-sans text-sm font-medium" :class="report.recColor">{{ report.recommendation }}</span></div>
        <div class="w-[110px]"><span class="font-sans text-[13px] text-muted-foreground">{{ report.generated }}</span></div>
        <div class="flex-1 flex items-center gap-2" @click.stop>
          <NuxtLink :to="`/dashboard/reports/${report.caseId}`" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</NuxtLink>
          <button @click="openShare(report.caseId)" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">share</button>
          <button class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">download</button>
        </div>
      </div>
    </div>

    <!-- Mobile Card List -->
    <div class="lg:hidden flex flex-col gap-3">
      <div v-for="report in filtered" :key="report.caseId" class="bg-white border border-border rounded-xl p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-semibold text-foreground">{{ report.tenant }}</span>
          <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium" :class="[report.statusBg, report.statusText]">{{ report.status }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-mono text-[12px] text-muted-foreground">{{ report.caseId }}</span>
          <span class="font-sans text-[12px] font-medium" :class="report.recColor">{{ report.recommendation }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-sans text-[12px] text-muted-foreground">{{ report.generated }}</span>
          <div class="flex gap-3">
            <NuxtLink :to="`/dashboard/reports/${report.caseId}`" class="material-symbols-rounded text-[18px] text-muted-foreground">visibility</NuxtLink>
            <button @click="openShare(report.caseId)" class="material-symbols-rounded text-[18px] text-muted-foreground">share</button>
          </div>
        </div>
      </div>
    </div>
    <DashboardShareReportModal v-model="showShare" />
    </template>
  </div>
</template>
