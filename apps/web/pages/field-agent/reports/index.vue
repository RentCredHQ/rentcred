<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Reports — RentCred Field Agent' })

const { api } = useApi()

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Pending', value: 'pending' },
]

const reports = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api('/field-agents/assignments', { params: { status: 'completed' } })
    reports.value = res as any[]
  } catch { /* empty */ }
  finally { loading.value = false }
})

const { activeFilter, filtered, resultCount } = useFilter({
  items: reports,
  searchFields: ['id', 'tenant', 'type', 'location'],
  customFilter: (item, _query, status) => {
    if (status === 'all') return true
    if (status === 'pending') return item.result === 'Pending Review'
    return item.result.toLowerCase() === status
  },
})

function resultClasses(result: string) {
  switch (result) {
    case 'Verified': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'Flagged': return 'bg-[#E5DCDA] text-[#8C1C00]'
    default: return 'bg-[#E9E3D8] text-[#804200]'
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-3">
      <h1 class="font-mono text-lg font-semibold text-foreground">My Reports</h1>
      <span class="bg-background rounded-full px-2.5 py-0.5 text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
    </div>
    <UiFilterTabs v-model="activeFilter" :tabs="filterTabs" variant="pill" />
    <div class="flex flex-col gap-3">
      <div v-for="r in filtered" :key="r.id" class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[12px] text-foreground">{{ r.id }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" :class="resultClasses(r.result)">{{ r.result }}</span>
        </div>
        <span class="font-sans text-sm font-medium text-foreground">{{ r.tenant }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ r.type }}</span>
        <div class="flex items-center justify-between text-[12px] text-muted-foreground font-sans">
          <span>{{ r.date }}</span>
          <span>{{ r.location }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
