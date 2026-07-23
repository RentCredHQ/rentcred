<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'ops' })

const { api } = useApi()

const stats = ref<any[]>([])
const recentCases = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [dashStats, casesRes] = await Promise.all([
      api<any>('/ops/dashboard/stats'),
      api<any>('/ops/dashboard/recent-cases'),
    ])

    const s = dashStats
    stats.value = [
      { label: 'Total Cases', value: s.totalCases ?? 0, icon: 'folder', change: '' },
      { label: 'Pending Verification', value: s.pendingVerifications ?? 0, icon: 'pending_actions', color: 'text-primary' },
      { label: 'Field Visits Today', value: s.fieldVisitsToday ?? 0, icon: 'location_on', color: 'text-st-blue-text' },
      { label: 'Reports Ready', value: s.reportsReady ?? 0, icon: 'rate_review', color: 'text-st-green-text' },
      { label: 'In Progress', value: s.inProgress ?? 0, icon: 'groups', color: 'text-st-blue-text' },
      { label: 'Completed This Week', value: s.completedThisWeek ?? 0, icon: 'verified_user', color: 'text-st-green-text' },
    ]

    const cases = (Array.isArray(casesRes) ? casesRes : casesRes?.data ?? []) as any[]
    const statusColorMap: Record<string, string> = {
      pending: 'bg-st-amber-bg text-st-amber-text',
      in_progress: 'bg-st-blue-bg text-st-blue-text',
      field_visit: 'bg-st-amber-bg text-st-amber-text',
      report_building: 'bg-st-amber-bg text-st-amber-text',
      completed: 'bg-st-green-bg text-st-green-text',
      rejected: 'bg-st-red-bg text-st-red-text',
      cancelled: 'bg-st-neutral-bg text-st-neutral-text',
    }
    recentCases.value = cases.map((c: any) => ({
      id: c.id,
      tenant: c.tenantName,
      agent: c.agent?.name ?? '—',
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
        <span class="font-mono text-2xl sm:text-3xl font-bold" :class="stat.color || 'text-foreground'">{{ stat.value }}</span>
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
          <!-- Empty State -->
          <div v-if="recentCases.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
            <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
              <span class="material-symbols-rounded text-[28px] text-muted-foreground">inbox</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <h3 class="font-mono text-base font-semibold text-foreground">No recent cases</h3>
              <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Cases will appear here as agents submit tenants</p>
            </div>
          </div>
          <div v-for="c in recentCases" :key="c.id" class="flex items-center justify-between px-6 py-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-muted-foreground truncate block" :title="c.id">{{ c.id.slice(0, 8) }}…</span>
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
