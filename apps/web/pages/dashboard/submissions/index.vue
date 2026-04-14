<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'My Submissions — RentCred' })

const { getSubmissions } = useSubmissions()

const showShare = ref(false)
const loading = ref(true)
const totalCount = ref(0)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Pending Review', value: 'Pending Review' },
  { label: 'Completed', value: 'Completed' },
]

function getStatusStyle(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
    in_progress: { bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    field_visit: { bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    report_building: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
  }
  return map[status] || { bg: 'bg-[#E7E8E5]', text: 'text-foreground' }
}

const submissions = ref<any[]>([])

const mappedSubmissions = computed(() =>
  submissions.value.map((s: any) => {
    const style = getStatusStyle(s.status)
    const label = SUBMISSION_STATUS_LABELS[s.status] || s.status
    return {
      name: s.tenantName,
      caseId: s.id,
      package: s.propertyType || 'Standard',
      status: label,
      statusBg: style.bg,
      statusText: style.text,
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
    { label: 'Needs Attention', value: String(needsAttention), valueColor: 'text-[#804200]' },
    { label: 'Completed', value: String(completed), valueColor: 'text-[#004D1A]' },
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
      <span class="px-2.5 py-1 rounded-full bg-[#E7E8E5] font-sans text-[12px] font-medium text-foreground">{{ resultCount }} active</span>
    </div>

    <!-- Search & Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by tenant name or case ID..." width="w-full sm:w-[280px]" />
    </UiFilterBar>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="card in summaryCards" :key="card.label" class="bg-white border border-border rounded-lg px-3.5 py-3 flex flex-col gap-1">
        <span class="font-sans text-[12px] text-muted-foreground">{{ card.label }}</span>
        <span class="font-mono text-xl font-bold" :class="card.valueColor">{{ card.value }}</span>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="hidden lg:flex items-center justify-between py-2">
      <span class="font-sans text-[12px] font-medium text-muted-foreground">3 selected</span>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 bg-foreground rounded-lg font-mono text-[12px] font-semibold text-white hover:opacity-90 transition-opacity">Export</button>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden lg:block bg-white border-[1.5px] border-border rounded-lg overflow-hidden">
      <!-- Column Headers -->
      <div class="flex bg-[#E7E8E5] px-4 py-3">
        <div class="w-[180px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Tenant Name</span></div>
        <div class="w-[140px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
        <div class="w-[130px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Package</span></div>
        <div class="w-[160px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
        <div class="w-[120px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Submitted</span></div>
        <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Actions</span></div>
      </div>

      <!-- Rows -->
      <NuxtLink
        v-for="sub in filtered"
        :key="sub.caseId"
        :to="`/dashboard/submissions/${sub.caseId}`"
        class="flex items-center px-4 py-3.5 border-b border-border hover:bg-surface/30 transition-colors cursor-pointer"
      >
        <div class="w-[180px]"><span class="font-sans text-sm font-medium text-foreground">{{ sub.name }}</span></div>
        <div class="w-[140px]"><span class="font-mono text-[13px] text-muted-foreground">{{ sub.caseId }}</span></div>
        <div class="w-[130px]"><span class="font-sans text-sm text-foreground">{{ sub.package }}</span></div>
        <div class="w-[160px]">
          <span class="inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium" :class="[sub.statusBg, sub.statusText]">{{ sub.status }}</span>
        </div>
        <div class="w-[120px]"><span class="font-sans text-[13px] text-muted-foreground">{{ sub.date }}</span></div>
        <div class="flex-1 flex items-center gap-2" @click.prevent.stop>
          <NuxtLink :to="`/dashboard/submissions/${sub.caseId}`" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</NuxtLink>
          <button @click="showShare = true" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">share</button>
          <button class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">more_vert</button>
        </div>
      </NuxtLink>

      <!-- Footer -->
      <div class="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing 1–{{ resultCount }} of {{ totalCount }} submissions</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground hover:bg-surface transition-colors">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white hover:opacity-90 transition-opacity">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground hover:bg-surface transition-colors">Next</button>
        </div>
      </div>
    </div>

    <!-- Mobile Card List -->
    <div class="lg:hidden flex flex-col gap-3">
      <NuxtLink
        v-for="sub in filtered"
        :key="sub.caseId"
        :to="`/dashboard/submissions/${sub.caseId}`"
        class="bg-white border border-border rounded-xl p-4 flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-semibold text-foreground">{{ sub.name }}</span>
          <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium" :class="[sub.statusBg, sub.statusText]">{{ sub.status }}</span>
        </div>
        <div class="flex items-center gap-4 text-[12px] text-muted-foreground font-sans">
          <span class="font-mono">{{ sub.caseId }}</span>
          <span>{{ sub.package }}</span>
          <span>{{ sub.date }}</span>
        </div>
      </NuxtLink>
    </div>
    <DashboardShareReportModal v-model="showShare" />
    </template>
  </div>
</template>
