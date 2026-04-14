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
    visits.value = assignmentsRes as any[]
    stats.value = statsRes
  } catch { /* empty */ }
  finally { loading.value = false }
})

function statusClasses(status: string) {
  switch (status) {
    case 'Completed': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'In Progress': return 'bg-[#E9E3D8] text-[#804200]'
    default: return 'bg-background text-muted-foreground'
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-3 gap-3">
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
      <NuxtLink v-for="v in visits" :key="v.id" :to="`/field-agent/visits/${v.id}`"
        class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-medium text-foreground">{{ v.tenant }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" :class="statusClasses(v.status)">{{ v.status }}</span>
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
