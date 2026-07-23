<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Audit Log — RentCred Ops' })

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
]

const dateOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
]

const { getAuditLogs } = useAuditLog()

const entries = ref<any[]>([])
const loading = ref(true)
const errored = ref(false)
const page = ref(1)
const totalEntries = ref(0)
const PAGE_SIZE = 20

/** "report_approved" → "Report Approved" */
function humanizeAction(action: string) {
  return String(action || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Actions that record something going wrong read as warnings. */
function statusFor(action: string) {
  return /fail|reject|mismatch|suspend|denied|error/i.test(action || '') ? 'Warning' : 'Success'
}

async function fetchEntries() {
  loading.value = true
  errored.value = false
  try {
    const res: any = await getAuditLogs({ page: page.value, limit: PAGE_SIZE })
    entries.value = (res.data ?? res.events ?? []).map((e: any) => ({
      time: e.createdAt
        ? new Date(e.createdAt).toLocaleString('en-NG', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })
        : '—',
      user: e.user?.name ?? 'System',
      action: humanizeAction(e.action),
      target: e.entityType ? `${humanizeAction(e.entityType)}: ${String(e.entityId ?? '').slice(0, 10)}` : '—',
      ip: e.ipAddress ?? '—',
      status: statusFor(e.action),
    }))
    totalEntries.value = res.pagination?.total ?? entries.value.length
  } catch {
    errored.value = true
    entries.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchEntries)

const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / PAGE_SIZE)))

function goPage(next: number) {
  if (next < 1 || next > totalPages.value || next === page.value) return
  page.value = next
  fetchEntries()
}

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: entries,
  searchFields: ['user', 'action', 'target', 'ip'],
  statusField: 'status',
})

const selectedDate = ref('all')
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Audit Log</h1>
        <span class="font-sans text-sm text-muted-foreground">Track all system activities and user actions</span>
      </div>
      <!-- Export intentionally omitted: there is no export endpoint, and a
           button that silently does nothing is worse than no button. -->
    </div>

    <!-- Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by user, action or IP..." width="w-full sm:w-[260px]" />
      <UiFilterDropdown v-model="selectedDate" :options="dateOptions" icon="calendar_today" />
    </UiFilterBar>

    <!-- Loading / error -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <div v-else-if="errored" class="flex flex-col items-center gap-3 py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground">cloud_off</span>
      <span class="font-sans text-sm text-muted-foreground">Couldn't load the audit log.</span>
      <button @click="fetchEntries" class="px-4 py-2 bg-primary text-foreground rounded font-sans text-[13px] font-medium hover:opacity-90 transition-opacity">
        Try again
      </button>
    </div>

    <!-- Table -->
    <div v-else class="bg-card border border-border rounded-xl overflow-hidden">
      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[150px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Timestamp</span></div>
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">User</span></div>
          <div class="w-[180px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Target</span></div>
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">IP Address</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
        </div>

        <div v-if="!filtered.length" class="flex flex-col items-center gap-2 py-14">
          <span class="material-symbols-rounded text-[26px] text-muted-foreground">history</span>
          <span class="font-sans text-sm text-muted-foreground">No audit entries recorded yet</span>
        </div>

        <div v-for="(entry, i) in filtered" :key="i" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[150px]"><span class="font-mono text-[12px] text-muted-foreground">{{ entry.time }}</span></div>
          <div class="w-[140px]"><span class="font-sans text-[13px] font-medium text-foreground">{{ entry.user }}</span></div>
          <div class="w-[180px]"><span class="font-sans text-[13px] text-foreground">{{ entry.action }}</span></div>
          <div class="w-[160px]"><span class="font-sans text-[13px] text-foreground">{{ entry.target }}</span></div>
          <div class="w-[140px]"><span class="font-mono text-[12px] text-muted-foreground">{{ entry.ip }}</span></div>
          <div class="flex-1">
            <span
              class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              :class="entry.status === 'Success' ? 'bg-st-green-bg text-st-green-text' : 'bg-st-amber-bg text-st-amber-text'"
            >
              {{ entry.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-for="(entry, i) in filtered" :key="i" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-sans text-sm font-medium text-foreground">{{ entry.action }}</span>
            <span
              class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
              :class="entry.status === 'Success' ? 'bg-st-green-bg text-st-green-text' : 'bg-st-amber-bg text-st-amber-text'"
            >
              {{ entry.status }}
            </span>
          </div>
          <span class="font-sans text-[13px] text-foreground block mb-1">{{ entry.target }}</span>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ entry.user }}</span>
            <span class="font-mono">{{ entry.time }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">
          Showing {{ resultCount }} of {{ totalEntries.toLocaleString() }} actions
        </span>
        <div v-if="totalPages > 1" class="flex items-center gap-1.5">
          <button
            :disabled="page === 1"
            @click="goPage(page - 1)"
            class="px-2.5 py-1 bg-card border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >Prev</button>
          <span class="px-2.5 py-1 font-sans text-[12px] text-muted-foreground">Page {{ page }} of {{ totalPages }}</span>
          <button
            :disabled="page === totalPages"
            @click="goPage(page + 1)"
            class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
