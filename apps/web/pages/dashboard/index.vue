<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Dashboard — RentCred' })

const { getDashboardStats } = useAgents()
const { getSubmissions } = useSubmissions()

const loading = ref(true)

const stats = ref({
  bundleCredits: { value: 0, total: 0, label: 'Bundle Credits', icon: 'inventory_2' },
  activeChecks: { value: 0, label: 'Active Checks', icon: 'pending_actions', badge: '', badgeBg: 'bg-[#E9E3D8]', badgeText: 'text-[#804200]' },
  reportsReady: { value: 0, label: 'Reports Ready', icon: 'task', badge: 'Ready to share', badgeBg: 'bg-[#DFE6E1]', badgeText: 'text-[#004D1A]' },
})

const submissions = ref<any[]>([])
const showShare = ref(false)

function getStatusStyle(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
    in_progress: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    pending: { bg: 'bg-[#E7E8E5]', text: 'text-foreground' },
    field_visit: { bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    report_building: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
  }
  return map[status] || { bg: 'bg-[#E7E8E5]', text: 'text-foreground' }
}

function getAction(status: string) {
  if (status === 'completed') return 'share'
  if (status === 'pending') return 'resend'
  return 'view'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const mappedSubmissions = computed(() =>
  submissions.value.map((s: any) => {
    const style = getStatusStyle(s.status)
    return {
      id: s.id,
      tenant: { name: s.tenantName, detail: `${s.neighborhood || ''} • ${s.propertyType || ''}` },
      package: 'Standard',
      packageColor: 'text-foreground',
      status: SUBMISSION_STATUS_LABELS[s.status] || s.status,
      statusBg: style.bg,
      statusText: style.text,
      date: formatDate(s.createdAt),
      action: getAction(s.status),
    }
  })
)

const recentActivity = computed(() =>
  submissions.value.slice(0, 4).map((s: any) => {
    const style = getStatusStyle(s.status)
    return {
      name: s.tenantName,
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: SUBMISSION_STATUS_LABELS[s.status] || s.status,
      statusBg: style.bg,
      statusText: style.text,
    }
  })
)

onMounted(async () => {
  try {
    const [statsRes, subsRes] = await Promise.all([
      getDashboardStats(),
      getSubmissions({ limit: 5 }),
    ])

    const d = statsRes.data
    stats.value = {
      bundleCredits: { value: d.creditBalance ?? 0, total: d.creditBalance ?? 0, label: 'Bundle Credits', icon: 'inventory_2' },
      activeChecks: { value: d.pendingVerifications ?? 0, label: 'Active Checks', icon: 'pending_actions', badge: `${d.pendingVerifications ?? 0} awaiting review`, badgeBg: 'bg-[#E9E3D8]', badgeText: 'text-[#804200]' },
      reportsReady: { value: d.completedReports ?? 0, label: 'Reports Ready', icon: 'task', badge: 'Ready to share', badgeBg: 'bg-[#DFE6E1]', badgeText: 'text-[#004D1A]' },
    }

    submissions.value = subsRes.data ?? []
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <template v-else>
    <!-- Mobile Greeting (shown on mobile only) -->
    <div class="lg:hidden">
      <h1 class="font-mono text-xl font-bold text-foreground">Good morning, Adebayo</h1>
      <p class="font-sans text-[13px] text-muted-foreground mt-1">Here's your overview for today</p>
    </div>

    <!-- Metrics Row / KPI Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Bundle Credits -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">{{ stats.bundleCredits.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ stats.bundleCredits.icon }}</span>
        </div>
        <div class="flex items-end gap-2">
          <span class="font-mono text-[28px] font-bold text-foreground leading-none">{{ stats.bundleCredits.value }}</span>
          <span class="font-sans text-[13px] text-muted-foreground pb-0.5">of {{ stats.bundleCredits.total }} remaining</span>
        </div>
        <!-- Progress Bar -->
        <div class="w-full h-1.5 bg-[#E7E8E5] rounded-full">
          <div class="h-1.5 bg-primary rounded-full" :style="{ width: `${(stats.bundleCredits.value / stats.bundleCredits.total) * 100}%` }" />
        </div>
      </div>

      <!-- Active Checks -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">{{ stats.activeChecks.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ stats.activeChecks.icon }}</span>
        </div>
        <span class="font-mono text-[28px] font-bold text-foreground leading-none">{{ stats.activeChecks.value }}</span>
        <span class="inline-block w-fit px-2 py-1 rounded-full text-[11px] font-medium" :class="[stats.activeChecks.badgeBg, stats.activeChecks.badgeText]">
          {{ stats.activeChecks.badge }}
        </span>
      </div>

      <!-- Reports Ready -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">{{ stats.reportsReady.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ stats.reportsReady.icon }}</span>
        </div>
        <span class="font-mono text-[28px] font-bold text-foreground leading-none text-[#004D1A]">{{ stats.reportsReady.value }}</span>
        <span class="inline-block w-fit px-2 py-1 rounded-full text-[11px] font-medium" :class="[stats.reportsReady.badgeBg, stats.reportsReady.badgeText]">
          {{ stats.reportsReady.badge }}
        </span>
      </div>
    </div>

    <!-- Desktop: Submissions Table -->
    <div class="hidden lg:block bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      <!-- Table Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-border">
        <div class="flex items-center gap-3">
          <span class="font-sans text-[15px] font-semibold text-foreground">My Submissions</span>
          <span class="px-2 py-0.5 rounded-full bg-[#E7E8E5] font-mono text-[12px] text-muted-foreground">{{ mappedSubmissions.length }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 h-9 bg-background border border-border rounded-lg w-[200px]">
          <span class="material-symbols-rounded text-[16px] text-muted-foreground">search</span>
          <input type="text" placeholder="Search tenants..." class="flex-1 bg-transparent text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none" />
        </div>
      </div>

      <!-- Column Headers -->
      <div class="flex bg-background border-b border-border">
        <div class="w-[100px] px-4 py-2.5"><span class="font-mono text-[12px] font-medium text-muted-foreground">Case ID</span></div>
        <div class="flex-1 px-4 py-2.5"><span class="font-sans text-[12px] font-medium text-muted-foreground">Tenant</span></div>
        <div class="w-[100px] px-4 py-2.5"><span class="font-sans text-[12px] font-medium text-muted-foreground">Package</span></div>
        <div class="w-[140px] px-4 py-2.5"><span class="font-sans text-[12px] font-medium text-muted-foreground">Status</span></div>
        <div class="w-[100px] px-4 py-2.5"><span class="font-sans text-[12px] font-medium text-muted-foreground">Submitted</span></div>
        <div class="w-[120px] px-4 py-2.5"><span class="font-sans text-[12px] font-medium text-muted-foreground">Action</span></div>
      </div>

      <!-- Rows -->
      <div v-for="sub in mappedSubmissions" :key="sub.id" class="flex items-center border-b border-border hover:bg-surface/30 transition-colors">
        <div class="w-[100px] px-4 py-3"><span class="font-mono text-[13px] text-foreground">{{ sub.id }}</span></div>
        <div class="flex-1 px-4 py-3">
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[13px] font-medium text-foreground">{{ sub.tenant.name }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ sub.tenant.detail }}</span>
          </div>
        </div>
        <div class="w-[100px] px-4 py-3"><span class="font-sans text-[13px] font-medium" :class="sub.packageColor">{{ sub.package }}</span></div>
        <div class="w-[140px] px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" :class="[sub.statusBg, sub.statusText]">{{ sub.status }}</span>
        </div>
        <div class="w-[100px] px-4 py-3"><span class="font-sans text-[13px] text-muted-foreground">{{ sub.date }}</span></div>
        <div class="w-[120px] px-4 py-3">
          <button
            v-if="sub.action === 'share'"
            @click="showShare = true"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-primary rounded text-[12px] font-medium font-sans text-foreground hover:opacity-90 transition-opacity"
          >
            <span class="material-symbols-rounded text-[14px]">share</span>
            Share
          </button>
          <NuxtLink
            v-else-if="sub.action === 'view'"
            :to="`/dashboard/submissions/${sub.id}`"
            class="px-3 py-1.5 border border-border rounded text-[12px] font-sans text-foreground hover:bg-surface transition-colors"
          >
            View
          </NuxtLink>
          <button
            v-else
            class="px-3 py-1.5 border border-border rounded text-[12px] font-sans text-foreground hover:bg-surface transition-colors"
          >
            Resend Invite
          </button>
        </div>
      </div>

      <!-- Table Footer -->
      <div class="flex items-center justify-between px-5 py-3">
        <span class="font-sans text-[13px] text-muted-foreground">Showing {{ mappedSubmissions.length }} submissions</span>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 h-8 border border-border rounded-lg text-[12px] font-sans text-foreground hover:bg-surface transition-colors">Previous</button>
          <button class="px-3 py-1.5 h-8 bg-primary rounded-lg text-[12px] font-sans font-medium text-foreground hover:opacity-90 transition-opacity">Next</button>
        </div>
      </div>
    </div>

    <!-- Mobile: Recent Activity (shown on mobile only) -->
    <div class="lg:hidden flex flex-col gap-3">
      <h2 class="font-mono text-base font-semibold text-foreground">Recent Activity</h2>
      <div class="flex flex-col gap-2">
        <div
          v-for="item in recentActivity"
          :key="item.name"
          class="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3"
        >
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-sm font-semibold text-foreground">{{ item.name }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ item.date }}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="[item.statusBg, item.statusText]">
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>
    <DashboardShareReportModal v-model="showShare" />
    </template>
  </div>
</template>
