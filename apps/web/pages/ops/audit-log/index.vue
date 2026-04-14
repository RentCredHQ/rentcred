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

const entries = ref([
  { time: '14 Mar, 09:41 AM', user: 'Adebayo Ogunsade', action: 'Approved KYB Application', target: 'Darent Realty Ltd.', ip: '102.89.34.102', status: 'Success' },
  { time: '14 Mar, 09:28 AM', user: 'Funke Adebayo', action: 'Assigned Field Agent', target: 'Case RC-1041', ip: '+1 (205) 432-6811', status: 'Success' },
  { time: '14 Mar, 08:55 AM', user: 'Chidi Nwosu', action: 'Generated Report', target: 'Tenant: Amina Eze', ip: '102.215.67.89', status: 'Success' },
  { time: '13 Mar, 06:17 PM', user: 'System', action: 'Login Failed (3 attempts)', target: 'admin@rentcred.ng', ip: '41.203.76.44', status: 'Warning' },
  { time: '13 Mar, 04:42 PM', user: 'Ngozi Onuoha', action: 'Rejected Tenant Report', target: 'RPT-0086', ip: '197.210.53.106', status: 'Success' },
  { time: '13 Mar, 02:10 PM', user: 'Emeka Udom', action: 'Updated Agent Permissions', target: 'Agent: Tunde Bakare', ip: '+1 (555) 671-8910', status: 'Success' },
])

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
      <button class="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
        <span class="material-symbols-rounded text-[16px]">download</span>
        Export Log
      </button>
    </div>

    <!-- Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search by user, action or IP..." width="w-[260px]" />
      <UiFilterDropdown v-model="selectedDate" :options="dateOptions" icon="calendar_today" />
    </UiFilterBar>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
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

        <div v-for="(entry, i) in filtered" :key="i" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[150px]"><span class="font-mono text-[12px] text-muted-foreground">{{ entry.time }}</span></div>
          <div class="w-[140px]"><span class="font-sans text-[13px] font-medium text-foreground">{{ entry.user }}</span></div>
          <div class="w-[180px]"><span class="font-sans text-[13px] text-foreground">{{ entry.action }}</span></div>
          <div class="w-[160px]"><span class="font-sans text-[13px] text-foreground">{{ entry.target }}</span></div>
          <div class="w-[140px]"><span class="font-mono text-[12px] text-muted-foreground">{{ entry.ip }}</span></div>
          <div class="flex-1">
            <span
              class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              :class="entry.status === 'Success' ? 'bg-[#DFE6E1] text-[#004D1A]' : 'bg-[#E9E3D8] text-[#804200]'"
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
              :class="entry.status === 'Success' ? 'bg-[#DFE6E1] text-[#004D1A]' : 'bg-[#E9E3D8] text-[#804200]'"
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
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of 1,847 actions</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">2</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">3</button>
          <button class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
