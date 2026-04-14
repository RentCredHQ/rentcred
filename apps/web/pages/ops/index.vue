<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'ops' })

const { api } = useApi()

const stats = ref<any[]>([])
const recentCases = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [dashStats, activity] = await Promise.all([
      api<any>('/ops/dashboard/stats'),
      api<any>('/ops/dashboard/activity'),
    ])

    const s = dashStats.data ?? dashStats
    stats.value = [
      { label: 'Total Cases', value: s.totalCases ?? 0, icon: 'folder', change: s.casesChangeLabel ?? '' },
      { label: 'Pending Verification', value: s.pendingVerifications ?? 0, icon: 'pending_actions', color: 'text-[#FF8400]' },
      { label: 'Field Visits Today', value: s.fieldVisitsToday ?? 0, icon: 'location_on', color: 'text-blue-600' },
      { label: 'Reports to Approve', value: s.reportsToApprove ?? 0, icon: 'rate_review', color: 'text-red-500' },
      { label: 'Active Field Agents', value: s.activeFieldAgents ?? 0, icon: 'groups', color: 'text-green-600' },
      { label: 'Pending KYB', value: s.pendingKYB ?? 0, icon: 'verified_user' },
    ]

    const cases = (activity.data ?? activity) as any[]
    const statusColorMap: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600',
      in_progress: 'bg-blue-50 text-blue-600',
      field_visit: 'bg-amber-50 text-amber-600',
      report_building: 'bg-purple-50 text-purple-600',
      completed: 'bg-green-50 text-green-600',
      rejected: 'bg-red-50 text-red-600',
    }
    recentCases.value = cases.map((c: any) => ({
      id: c.id,
      tenant: c.tenantName,
      agent: c.agentName ?? c.agent?.name ?? '—',
      status: SUBMISSION_STATUS_LABELS[c.status] ?? c.status,
      statusColor: statusColorMap[c.status] ?? 'bg-gray-50 text-gray-600',
      updated: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
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
        <h1 class="font-mono text-xl font-bold text-foreground">Operations Dashboard</h1>
        <span class="font-sans text-sm text-muted-foreground">Overview of all verification operations</span>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 border border-border rounded-lg text-sm font-sans text-foreground hover:bg-surface transition-colors">
          <span class="material-symbols-rounded text-[16px] mr-1">download</span>
          Export
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm text-muted-foreground">{{ stat.label }}</span>
          <span class="material-symbols-rounded text-[20px] text-muted-foreground">{{ stat.icon }}</span>
        </div>
        <span class="font-mono text-3xl font-bold" :class="stat.color || 'text-foreground'">{{ stat.value }}</span>
        <span v-if="stat.change" class="font-sans text-xs text-muted-foreground">{{ stat.change }}</span>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Cases -->
      <div class="bg-card border border-border rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="font-mono text-base font-semibold text-foreground">Recent Cases</h2>
          <NuxtLink to="/ops/cases" class="text-primary text-sm font-sans hover:underline">View all</NuxtLink>
        </div>
        <div class="divide-y divide-border">
          <div v-for="c in recentCases" :key="c.id" class="flex items-center justify-between px-6 py-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-muted-foreground">{{ c.id }}</span>
                <span class="font-sans text-sm font-medium text-foreground">{{ c.tenant }}</span>
              </div>
              <span class="font-sans text-xs text-muted-foreground">{{ c.agent }} · {{ c.updated }}</span>
            </div>
            <span class="inline-block px-2.5 py-1 rounded text-xs font-mono font-medium" :class="c.statusColor">
              {{ c.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="font-mono text-base font-semibold text-foreground mb-4">Quick Actions</h2>
        <div class="flex flex-col gap-3">
          <NuxtLink to="/ops/kanban" class="flex items-center gap-3 px-4 py-3 border border-border rounded-lg text-sm font-sans text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[20px] text-primary">view_kanban</span>
            Kanban Board
          </NuxtLink>
          <NuxtLink to="/ops/field-agents" class="flex items-center gap-3 px-4 py-3 border border-border rounded-lg text-sm font-sans text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[20px] text-primary">groups</span>
            Manage Field Agents
          </NuxtLink>
          <NuxtLink to="/ops/kyb" class="flex items-center gap-3 px-4 py-3 border border-border rounded-lg text-sm font-sans text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[20px] text-primary">verified_user</span>
            KYB Approval Queue
          </NuxtLink>
          <NuxtLink to="/ops/reports" class="flex items-center gap-3 px-4 py-3 border border-border rounded-lg text-sm font-sans text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[20px] text-primary">rate_review</span>
            Review Reports
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
