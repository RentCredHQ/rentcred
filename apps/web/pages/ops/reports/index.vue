<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Reports — RentCred Ops' })

const showApproval = ref(false)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending Review', value: 'pending review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const kpis = ref([
  { label: 'TOTAL REPORTS', value: '89', sub: '+8 this week', valueColor: 'text-foreground' },
  { label: 'PENDING REVIEW', value: '14', sub: '5 due today', valueColor: 'text-primary' },
  { label: 'APPROVED', value: '68', sub: '76% approval rate', valueColor: 'text-[#004D1A]' },
  { label: 'AVG TURNAROUND', value: '3.2d', sub: 'Median 2.8 days', valueColor: 'text-foreground' },
])

const reports = ref([
  { id: 'RPT-0089', caseId: 'RC-1041', tenant: 'Amaechi Oguntayo', agent: 'Chidi Nwosu', risk: 'Low', riskBg: 'bg-[#DFE6E1]', riskText: 'text-[#004D1A]', status: 'Pending Review', statusBg: 'bg-[#E9E3D8]', statusText: 'text-[#804200]', date: 'Mar 14' },
  { id: 'RPT-0088', caseId: 'RC-1040', tenant: 'Obiorah Eze', agent: 'Funke Kadiri', risk: 'Medium', riskBg: 'bg-[#E9E3D8]', riskText: 'text-[#804200]', status: 'Approved', statusBg: 'bg-[#DFE6E1]', statusText: 'text-[#004D1A]', date: 'Mar 13' },
  { id: 'RPT-0087', caseId: 'RC-1039', tenant: 'Nkechi Nwokey', agent: 'Bola Adewale', risk: 'Low', riskBg: 'bg-[#DFE6E1]', riskText: 'text-[#004D1A]', status: 'Approved', statusBg: 'bg-[#DFE6E1]', statusText: 'text-[#004D1A]', date: 'Mar 12' },
  { id: 'RPT-0086', caseId: 'RC-1038', tenant: 'Fatima Bello', agent: 'Amara Okafor', risk: 'High', riskBg: 'bg-[#E5DCDA]', riskText: 'text-[#8C1C00]', status: 'Rejected', statusBg: 'bg-[#E5DCDA]', statusText: 'text-[#8C1C00]', date: 'Mar 11' },
  { id: 'RPT-0085', caseId: 'RC-1037', tenant: 'Tunde Bakare', agent: 'Yemi Ogundimu', risk: 'Low', riskBg: 'bg-[#DFE6E1]', riskText: 'text-[#004D1A]', status: 'Pending Review', statusBg: 'bg-[#E9E3D8]', statusText: 'text-[#804200]', date: 'Mar 10' },
  { id: 'RPT-0084', caseId: 'RC-1036', tenant: 'Ngozi Udom', agent: 'Chidi Nwosu', risk: 'Medium', riskBg: 'bg-[#E9E3D8]', riskText: 'text-[#804200]', status: 'Draft', statusBg: 'bg-background', statusText: 'text-muted-foreground', date: 'Mar 9' },
])

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: reports,
  searchFields: ['id', 'caseId', 'tenant', 'agent'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Reports</h1>
        <span class="font-sans text-sm text-muted-foreground">Review and approve verification reports</span>
      </div>
    </div>

    <!-- Tabs & Search -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search reports..." />
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono text-[28px] font-bold" :class="kpi.valueColor">{{ kpi.value }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-semibold text-foreground">Verification Reports</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Report ID</span></div>
          <div class="w-[90px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Case ID</span></div>
          <div class="w-[150px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Tenant</span></div>
          <div class="w-[120px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Field Agent</span></div>
          <div class="w-[90px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Risk Level</span></div>
          <div class="w-[120px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[80px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Date</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <div v-for="rpt in filtered" :key="rpt.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[100px]"><span class="font-mono text-[12px] font-medium text-foreground">{{ rpt.id }}</span></div>
          <div class="w-[90px]"><span class="font-mono text-[12px] text-muted-foreground">{{ rpt.caseId }}</span></div>
          <div class="w-[150px]"><span class="font-sans text-[13px] text-foreground">{{ rpt.tenant }}</span></div>
          <div class="w-[120px]"><span class="font-sans text-[13px] text-foreground">{{ rpt.agent }}</span></div>
          <div class="w-[90px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[rpt.riskBg, rpt.riskText]">{{ rpt.risk }}</span>
          </div>
          <div class="w-[120px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[rpt.statusBg, rpt.statusText]">{{ rpt.status }}</span>
          </div>
          <div class="w-[80px]"><span class="font-sans text-[13px] text-foreground">{{ rpt.date }}</span></div>
          <div class="flex-1">
            <span @click="showApproval = true" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-for="rpt in filtered" :key="rpt.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[13px] font-medium text-foreground">{{ rpt.id }}</span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[rpt.riskBg, rpt.riskText]">{{ rpt.risk }}</span>
            </div>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[rpt.statusBg, rpt.statusText]">{{ rpt.status }}</span>
          </div>
          <span class="font-sans text-sm text-foreground block mb-1">{{ rpt.tenant }}</span>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans">
            <span>{{ rpt.agent }}</span>
            <span class="font-mono">{{ rpt.caseId }}</span>
            <span>{{ rpt.date }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing 6 of 89 reports</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">2</button>
          <button class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white">Next</button>
        </div>
      </div>
    </div>
    <!-- Report Approval Modal -->
    <OpsReportApprovalModal v-model="showApproval" />
  </div>
</template>
