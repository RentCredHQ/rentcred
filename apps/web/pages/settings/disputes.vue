<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Dispute Resolution — RentCred' })

const kpis = ref([
  { label: 'TOTAL DISPUTES', value: '14', sub: '+4 this week · 2 escalated', valueColor: 'text-foreground' },
  { label: 'OPEN', value: '5', sub: '2 due today · 1 overdue', valueColor: 'text-[#804200]' },
  { label: 'RESOLVED', value: '9', sub: '64% within SLA', valueColor: 'text-[#004D1A]' },
  { label: 'AVG RESOLUTION', value: '2.8 days', sub: 'Median 2.1 days', valueColor: 'text-foreground', smallValue: true },
])

const disputes = ref([
  { id: 'DSP-0023', parties: 'Adesola O. / Bola A.', reason: 'Employment mismatch after employer callback', priority: 'High', priorityBg: 'bg-[#E5DCDA]', priorityText: 'text-[#8C1C00]', status: 'Open', statusBg: 'bg-[#E9E3D8]', statusText: 'text-[#804200]', deadline: '6h left' },
  { id: 'DSP-0022', parties: 'Chioma E. / Emeka N.', reason: 'Address discrepancy between NIN and utility bill', priority: 'Medium', priorityBg: 'bg-[#E9E3D8]', priorityText: 'text-[#804200]', status: 'Open', statusBg: 'bg-[#E9E3D8]', statusText: 'text-[#804200]', deadline: '12h left' },
  { id: 'DSP-0021', parties: 'Tunde B. / Fatima B.', reason: 'Reference check returned conflicting information', priority: 'Low', priorityBg: 'bg-[#DFE6E1]', priorityText: 'text-[#004D1A]', status: 'Resolved', statusBg: 'bg-[#DFE6E1]', statusText: 'text-[#004D1A]', deadline: 'Closed' },
  { id: 'DSP-0020', parties: 'Yemi A. / Ngozi U.', reason: 'Tenant disputes identity verification result', priority: 'High', priorityBg: 'bg-[#E5DCDA]', priorityText: 'text-[#8C1C00]', status: 'Escalated', statusBg: 'bg-[#E5DCDA]', statusText: 'text-[#8C1C00]', deadline: 'Overdue' },
])

const showNewDispute = ref(false)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Escalated', value: 'escalated' },
]

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: disputes,
  searchFields: ['id', 'parties', 'reason'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/settings" class="lg:hidden">
          <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
        </NuxtLink>
        <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Dispute Resolution</h1>
      </div>
      <button @click="showNewDispute = true" class="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
        <span class="material-symbols-rounded text-[16px]">add</span>
        New Dispute
      </button>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-white border border-border rounded-lg p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono font-bold" :class="[kpi.valueColor, kpi.smallValue ? 'text-2xl' : 'text-[28px]']">{{ kpi.value }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Filters -->
    <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />

    <!-- Disputes Table -->
    <div class="bg-white border border-border rounded-lg overflow-hidden">
      <!-- Table Header Row -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">DISPUTE LOG</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
        <UiFilterSearch v-model="searchQuery" placeholder="Search disputes..." width="w-[200px]" />
      </div>

      <!-- Desktop -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Dispute ID</span></div>
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Parties</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Reason</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Priority</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[110px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Deadline</span></div>
          <div class="w-[70px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <div v-for="d in filtered" :key="d.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[140px]"><span class="font-mono text-[13px] font-medium text-foreground">{{ d.id }}</span></div>
          <div class="w-[160px]"><span class="font-sans text-[13px] text-foreground">{{ d.parties }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-foreground">{{ d.reason }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[d.priorityBg, d.priorityText]">{{ d.priority }}</span>
          </div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[d.statusBg, d.statusText]">{{ d.status }}</span>
          </div>
          <div class="w-[110px]"><span class="font-sans text-[13px] text-foreground">{{ d.deadline }}</span></div>
          <div class="w-[70px]">
            <NuxtLink :to="`/settings/disputes/${d.id}`">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div v-for="d in filtered" :key="d.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-mono text-[13px] font-medium text-foreground">{{ d.id }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[d.statusBg, d.statusText]">{{ d.status }}</span>
          </div>
          <span class="font-sans text-sm text-foreground block mb-1">{{ d.reason }}</span>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ d.parties }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[d.priorityBg, d.priorityText]">{{ d.priority }}</span>
            <span>{{ d.deadline }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing 4 of 14 disputes</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Next</button>
        </div>
      </div>
    </div>

    <!-- New Dispute Modal -->
    <OpsNewDisputeModal v-model="showNewDispute" />
  </div>
</template>
