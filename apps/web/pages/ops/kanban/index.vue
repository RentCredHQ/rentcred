<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Kanban Board — RentCred Ops' })

const { getSubmissions } = useSubmissions()
const loading = ref(true)

// Every status needs a home here: cards whose status matches no column are
// dropped from the board entirely, which silently hid rejected cases.
const columnDefs = [
  { status: 'pending', statuses: ['pending'], title: 'Pending Assignment', color: 'bg-st-amber-bg', textColor: 'text-st-amber-text' },
  { status: 'in_progress', statuses: ['in_progress'], title: 'In Progress', color: 'bg-st-blue-bg', textColor: 'text-st-blue-text' },
  { status: 'field_visit', statuses: ['field_visit'], title: 'Field Visit', color: 'bg-st-amber-bg', textColor: 'text-st-amber-text' },
  { status: 'report_building', statuses: ['report_building'], title: 'Pending Review', color: 'bg-st-amber-bg', textColor: 'text-st-amber-text' },
  { status: 'completed', statuses: ['completed'], title: 'Completed', color: 'bg-st-green-bg', textColor: 'text-st-green-text' },
  { status: 'closed', statuses: ['rejected', 'cancelled'], title: 'Rejected / Cancelled', color: 'bg-st-red-bg', textColor: 'text-st-red-text' },
]

const columns = ref<any[]>(columnDefs.map(c => ({ ...c, cards: [] })))

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

onMounted(async () => {
  try {
    const res = await getSubmissions({ limit: 100 })
    const items = res.data ?? []

    const grouped: Record<string, any[]> = {}
    for (const col of columnDefs) grouped[col.status] = []

    // Map each status to the column that owns it, so nothing is dropped.
    const columnForStatus: Record<string, string> = {}
    for (const col of columnDefs) {
      for (const status of col.statuses) columnForStatus[status] = col.status
    }

    for (const s of items) {
      const bucket = grouped[columnForStatus[s.status]]
      if (!bucket) continue
      bucket.push({
        id: s.id,
        tenant: s.tenantName ?? '',
        agent: s.agent?.name ?? '—',
        priority: '—',
        priorityBg: 'bg-st-amber-bg',
        priorityText: 'text-st-amber-text',
        updated: s.updatedAt ? timeAgo(s.updatedAt) : '—',
        assignee: '',
      })
    }

    columns.value = columnDefs.map(c => ({
      ...c,
      cards: grouped[c.status] ?? [],
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Kanban Board</h1>
        <span class="font-sans text-sm text-muted-foreground">Visual case pipeline overview</span>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/ops/cases" class="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
          <span class="material-symbols-rounded text-[16px]">table_rows</span>
          Table View
        </NuxtLink>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="flex gap-4 overflow-x-auto pb-4">
      <div v-for="col in columns" :key="col.title" class="flex-shrink-0 w-[260px] sm:w-[280px] flex flex-col gap-3">
        <!-- Column Header -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[12px] font-semibold text-foreground">{{ col.title }}</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold" :class="[col.color, col.textColor]">{{ col.cards.length }}</span>
          </div>
        </div>

        <!-- Cards -->
        <div class="flex flex-col gap-2.5">
          <NuxtLink
            v-for="card in col.cards"
            :key="card.id"
            :to="`/ops/cases/${card.id}`"
            class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-[12px] font-medium text-foreground truncate block" :title="card.id">{{ card.id.slice(0, 8) }}…</span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[card.priorityBg, card.priorityText]">{{ card.priority }}</span>
            </div>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ card.tenant }}</span>
            <div class="flex items-center justify-between">
              <span class="font-sans text-[11px] text-muted-foreground">{{ card.agent }}</span>
              <span class="font-sans text-[11px] text-muted-foreground">{{ card.updated }}</span>
            </div>
            <div v-if="card.assignee" class="flex items-center gap-1.5 pt-0.5">
              <div class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span class="font-mono text-[8px] font-semibold text-primary">{{ card.assignee.split(' ').map(n => n[0]).join('') }}</span>
              </div>
              <span class="font-sans text-[11px] text-muted-foreground">{{ card.assignee }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
