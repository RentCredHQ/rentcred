<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'My Assignments — RentCred Field Agent' })

const { api } = useApi()

const assignments = ref<any[]>([])
const loading = ref(true)
const activeFilter = ref('all')

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

async function fetchAssignments() {
  loading.value = true
  try {
    const params: any = {}
    if (activeFilter.value !== 'all') params.status = activeFilter.value
    const res = await api('/field-agents/assignments', { params }) as any
    const items = res?.data ?? res ?? []
    assignments.value = (Array.isArray(items) ? items : []).map((a: any) => ({
      id: a.id,
      submissionId: a.submissionId || a.submission?.id || a.id,
      tenant: a.submission?.tenantName || '—',
      address: a.submission?.propertyAddress || '—',
      type: a.submission?.propertyType || '—',
      area: [a.submission?.neighborhood, a.submission?.state].filter(Boolean).join(', ') || '—',
      status: a.status || 'assigned',
      scheduledDate: a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      scheduledTime: a.scheduledDate ? new Date(a.scheduledDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—',
      createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
}

watch(activeFilter, () => fetchAssignments())
onMounted(() => fetchAssignments())

function statusLabel(status: string) {
  const map: Record<string, string> = { assigned: 'Pending', in_progress: 'In Progress', completed: 'Completed' }
  return map[status] || status
}

function statusClasses(status: string) {
  if (status === 'completed') return 'bg-st-green-bg text-st-green-text'
  if (status === 'in_progress') return 'bg-st-amber-bg text-st-amber-text'
  return 'bg-blue-50 text-blue-600'
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="font-mono text-xl font-bold text-foreground">My Assignments</h1>
      <span class="font-sans text-sm text-muted-foreground">All field visit assignments</span>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 overflow-x-auto">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        @click="activeFilter = tab.value"
        class="px-4 py-2 rounded-full text-[12px] font-mono font-semibold whitespace-nowrap transition-colors"
        :class="activeFilter === tab.value ? 'bg-foreground text-white' : 'bg-card border border-border text-muted-foreground'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="assignments.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
      <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
        <span class="material-symbols-rounded text-[28px] text-muted-foreground">assignment</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <h3 class="font-mono text-base font-semibold text-foreground">No assignments</h3>
        <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">You have no field visit assignments{{ activeFilter !== 'all' ? ' with this status' : '' }}</p>
      </div>
    </div>

    <!-- Assignment Cards -->
    <div v-else class="flex flex-col gap-3">
      <NuxtLink
        v-for="a in assignments"
        :key="a.id"
        :to="`/field-agent/visits/${a.submissionId}`"
        class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5 hover:border-primary/40 transition-colors"
      >
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-medium text-foreground">{{ a.tenant }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" :class="statusClasses(a.status)">{{ statusLabel(a.status) }}</span>
        </div>
        <span class="font-sans text-[12px] text-muted-foreground">{{ a.type }}</span>
        <div class="flex items-center gap-1 text-[12px] text-muted-foreground font-sans">
          <span class="material-symbols-rounded text-[14px]">location_on</span>
          {{ a.address }}
        </div>
        <div class="flex items-center justify-between text-[12px] text-muted-foreground font-sans">
          <div class="flex items-center gap-1">
            <span class="material-symbols-rounded text-[14px]">calendar_today</span>
            {{ a.scheduledDate }}
          </div>
          <span class="font-mono">{{ a.scheduledTime }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
