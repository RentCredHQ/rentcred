<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Dashboard — RentCred Field Agent' })

const { api } = useApi()

const visits = ref<any[]>([])
const stats = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const [assignmentsRes, statsRes] = await Promise.all([
      api('/field-agents/assignments', { params: { status: 'assigned' } }),
      api('/field-agents/dashboard/stats'),
    ])
    const assignData = (assignmentsRes as any)?.data ?? assignmentsRes
    visits.value = (Array.isArray(assignData) ? assignData : []).map((a: any) => ({
      id: a.id,
      submissionId: a.submissionId || a.submission?.id || a.id,
      tenant: a.submission?.tenantName || a.tenantName || '—',
      address: a.submission?.propertyAddress || a.propertyAddress || '—',
      type: a.submission?.propertyType || a.type || '—',
      status: a.status || 'assigned',
      time: a.scheduledDate ? new Date(a.scheduledDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—',
    }))
    const s = (statsRes as any)?.data ?? statsRes
    stats.value = {
      todaysVisits: s?.todaysVisits ?? s?.todayVisits ?? 0,
      completed: s?.completedVisits ?? s?.completed ?? 0,
      pending: s?.pending ?? s?.activeAssignments ?? 0,
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

function statusClasses(status: string) {
  const s = status.toLowerCase()
  if (s === 'completed') return 'bg-[#DFE6E1] text-[#004D1A]'
  if (s === 'in_progress' || s === 'in progress') return 'bg-[#E9E3D8] text-[#804200]'
  if (s === 'assigned' || s === 'pending') return 'bg-blue-50 text-blue-600'
  return 'bg-[#E9E3D8] text-[#804200]'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    assigned: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  }
  return map[status] || status
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-1">
        <span class="font-mono text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Today's Visits</span>
        <span class="font-mono text-2xl font-bold text-primary">{{ stats?.todaysVisits ?? '—' }}</span>
      </div>
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-1">
        <span class="font-mono text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Completed</span>
        <span class="font-mono text-2xl font-bold text-[#004D1A]">{{ stats?.completed ?? '—' }}</span>
      </div>
      <div class="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-1">
        <span class="font-mono text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Pending</span>
        <span class="font-mono text-2xl font-bold text-[#804200]">{{ stats?.pending ?? '—' }}</span>
      </div>
    </div>
    <span class="font-mono text-base font-semibold text-foreground">Today's Schedule</span>
    <div class="flex flex-col gap-3">
      <NuxtLink v-for="v in visits" :key="v.id" :to="`/field-agent/visits/${v.submissionId}`"
        class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-medium text-foreground">{{ v.tenant }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" :class="statusClasses(v.status)">{{ statusLabel(v.status) }}</span>
        </div>
        <span class="font-sans text-[12px] text-muted-foreground">{{ v.type }}</span>
        <div class="flex items-center justify-between text-[12px] text-muted-foreground font-sans">
          <div class="flex items-center gap-1">
            <span class="material-symbols-rounded text-[14px]">location_on</span>
            {{ v.address }}
          </div>
          <span>{{ v.time }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
