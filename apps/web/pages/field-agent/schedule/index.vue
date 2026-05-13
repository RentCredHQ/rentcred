<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Schedule — RentCred Field Agent' })

const { api } = useApi()

const activeDay = ref('Today')
const days = ['Today', 'Tomorrow', 'This Week']

const schedule = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api('/field-agents/assignments') as any
    // Backend returns { data: assignments[], pagination: {...} }
    const assignments = res?.data ?? res ?? []
    schedule.value = (Array.isArray(assignments) ? assignments : []).map((a: any) => ({
      id: a.submissionId || a.submission?.id || a.id,
      tenant: a.submission?.tenantName || a.tenantName || '—',
      type: a.submission?.propertyType || a.type || '—',
      address: a.submission?.propertyAddress || a.propertyAddress || '—',
      status: a.status === 'assigned' ? 'Pending' : a.status === 'in_progress' ? 'In Progress' : a.status === 'completed' ? 'Completed' : a.status || '—',
      time: a.scheduledDate ? new Date(a.scheduledDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—',
    }))
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
    <h1 class="font-mono text-lg font-semibold text-foreground">Schedule</h1>
    <div class="flex gap-2 overflow-x-auto">
      <button v-for="d in days" :key="d" @click="activeDay = d"
        class="px-4 py-2 rounded-full text-[12px] font-mono font-semibold whitespace-nowrap transition-colors"
        :class="activeDay === d ? 'bg-foreground text-white' : 'bg-card border border-border text-muted-foreground'">
        {{ d }}
      </button>
    </div>
    <div class="flex flex-col gap-3">
      <NuxtLink v-for="v in schedule" :key="v.id" :to="`/field-agent/visits/${v.id}`"
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
          <span class="font-mono">{{ v.time }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
