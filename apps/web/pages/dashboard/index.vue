<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Dashboard — RentCred' })

const authStore = useAuthStore()
const { getDashboardStats } = useAgents()
const { getSubmissions } = useSubmissions()
const { info } = useToast()

const greetingName = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ')[0] || 'there'
})

const greetingTime = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const loading = ref(true)

const stats = ref({
  bundleCredits: { value: 0, total: 0, label: 'Bundle Credits', icon: 'inventory_2' },
  activeChecks: { value: 0, label: 'Active Checks', icon: 'pending_actions', badge: '', badgeHue: 'amber' as const },
  reportsReady: { value: 0, label: 'Reports Ready', icon: 'task', badge: 'Ready to share', badgeHue: 'green' as const },
})

const submissions = ref<any[]>([])
const showShare = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const totalSubmissions = ref(0)
const pageSize = 5

function getAction(status: string) {
  if (status === 'completed') return 'share'
  if (status === 'pending') return 'resend'
  return 'view'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const mappedSubmissions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return submissions.value
    .map((s: any) => {
      return {
        id: s.id,
        tenant: { name: s.tenantName, detail: `${s.neighborhood || ''} • ${s.propertyType || ''}` },
        package: 'Standard',
        packageColor: 'text-foreground',
        statusRaw: s.status,
        status: SUBMISSION_STATUS_LABELS[s.status] || s.status,
        date: formatDate(s.createdAt),
        action: getAction(s.status),
      }
    })
    .filter((sub) => {
      if (!query) return true
      return sub.tenant.name.toLowerCase().includes(query) || sub.id.toLowerCase().includes(query)
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalSubmissions.value / pageSize)))

const recentActivity = computed(() =>
  submissions.value.slice(0, 4).map((s: any) => {
    return {
      name: s.tenantName,
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      statusRaw: s.status,
      status: SUBMISSION_STATUS_LABELS[s.status] || s.status,
    }
  })
)

async function fetchSubmissions() {
  try {
    const subsRes = await getSubmissions({ limit: pageSize, page: currentPage.value })
    submissions.value = subsRes.data ?? []
    totalSubmissions.value = subsRes.pagination?.total ?? submissions.value.length
  } catch { /* empty */ }
}

onMounted(async () => {
  try {
    const [statsRes, subsRes] = await Promise.all([
      getDashboardStats(),
      getSubmissions({ limit: pageSize, page: 1 }),
    ])

    const d = statsRes.data ?? statsRes
    stats.value = {
      bundleCredits: { value: d.creditBalance ?? 0, total: d.creditBalance ?? 0, label: 'Bundle Credits', icon: 'inventory_2' },
      activeChecks: { value: d.pendingSubmissions ?? 0, label: 'Active Checks', icon: 'pending_actions', badge: `${d.pendingSubmissions ?? 0} awaiting review`, badgeHue: 'amber' },
      reportsReady: { value: d.reportsReady ?? 0, label: 'Reports Ready', icon: 'task', badge: 'Ready to share', badgeHue: 'green' },
    }

    submissions.value = subsRes.data ?? []
    totalSubmissions.value = subsRes.pagination?.total ?? submissions.value.length
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State — skeletons -->
    <div v-if="loading" class="flex flex-col gap-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
          <UiSkeleton w="44%" h="12px" />
          <UiSkeleton w="64px" h="28px" />
          <UiSkeleton w="60%" h="10px" />
        </div>
      </div>
      <div class="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div class="px-5 py-4 border-b border-border"><UiSkeleton w="140px" h="16px" /></div>
        <UiSkeletonRows :rows="5" />
      </div>
    </div>

    <template v-else>
    <!-- KYB Banner -->
    <div
      v-if="authStore.user?.kybStatus !== 'approved'"
      class="bg-[#0D0D0D] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <span class="material-symbols-rounded text-[22px] text-[#FF8400]">warning</span>
        <div>
          <p class="font-sans text-sm font-semibold">Complete your KYB verification</p>
          <p class="font-sans text-xs text-white/60 mt-0.5">
            {{ authStore.user?.kybStatus === 'submitted' ? 'Your application is under review.' : 'You need to verify your business before you can submit tenants for screening.' }}
          </p>
        </div>
      </div>
      <NuxtLink
        v-if="authStore.user?.kybStatus !== 'submitted'"
        to="/settings/kyb"
        class="px-4 py-2 bg-[#FF8400] text-[#0D0D0D] font-sans text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        Start KYB
      </NuxtLink>
      <span
        v-else
        class="px-3 py-1.5 bg-white/10 text-white/80 font-sans text-xs font-medium"
      >
        Under Review
      </span>
    </div>

    <!-- Mobile Greeting (shown on mobile only) -->
    <div class="lg:hidden">
      <h1 class="font-mono text-xl font-bold text-foreground">{{ greetingTime }}, {{ greetingName }}</h1>
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
          <div class="h-1.5 bg-primary rounded-full" :style="{ width: `${stats.bundleCredits.total > 0 ? (stats.bundleCredits.value / stats.bundleCredits.total) * 100 : 0}%` }" />
        </div>
      </div>

      <!-- Active Checks -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">{{ stats.activeChecks.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ stats.activeChecks.icon }}</span>
        </div>
        <span class="font-mono text-[28px] font-bold text-foreground leading-none">{{ stats.activeChecks.value }}</span>
        <UiStatusPill v-if="stats.activeChecks.badge" :hue="stats.activeChecks.badgeHue" :label="stats.activeChecks.badge" />
      </div>

      <!-- Reports Ready -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">{{ stats.reportsReady.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ stats.reportsReady.icon }}</span>
        </div>
        <span class="font-mono text-[28px] font-bold leading-none text-st-green-text">{{ stats.reportsReady.value }}</span>
        <UiStatusPill v-if="stats.reportsReady.badge" :hue="stats.reportsReady.badgeHue" :label="stats.reportsReady.badge" />
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
          <input v-model="searchQuery" type="text" placeholder="Search tenants..." class="flex-1 bg-transparent text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none" />
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

      <!-- Empty State -->
      <div v-if="mappedSubmissions.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">description</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <h3 class="font-mono text-base font-semibold text-foreground">No submissions yet</h3>
          <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Submit your first tenant to get started</p>
        </div>
      </div>

      <!-- Rows -->
      <template v-if="mappedSubmissions.length > 0">
      <div v-for="sub in mappedSubmissions" :key="sub.id" class="flex items-center border-b border-border hover:bg-surface/30 transition-colors">
        <div class="w-[100px] px-4 py-3"><span class="font-mono text-[13px] text-foreground truncate block" :title="sub.id">{{ sub.id.slice(0, 10) }}…</span></div>
        <div class="flex-1 px-4 py-3">
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[13px] font-medium text-foreground">{{ sub.tenant.name }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ sub.tenant.detail }}</span>
          </div>
        </div>
        <div class="w-[100px] px-4 py-3"><span class="font-sans text-[13px] font-medium" :class="sub.packageColor">{{ sub.package }}</span></div>
        <div class="w-[140px] px-4 py-3">
          <UiStatusPill :status="sub.statusRaw" :label="sub.status" />
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
            @click="info('Invite resend is not available yet — email service required')"
            class="px-3 py-1.5 border border-border rounded text-[12px] font-sans text-foreground hover:bg-surface transition-colors"
          >
            Resend Invite
          </button>
        </div>
      </div>

      </template>

      <!-- Table Footer -->
      <div class="flex items-center justify-between px-5 py-3">
        <span class="font-sans text-[13px] text-muted-foreground">Showing {{ mappedSubmissions.length }} of {{ totalSubmissions }} submissions</span>
        <div class="flex items-center gap-2">
          <button @click="currentPage > 1 && (currentPage--, fetchSubmissions())" :disabled="currentPage <= 1" class="px-3 py-1.5 h-8 border border-border rounded-lg text-[12px] font-sans text-foreground hover:bg-surface transition-colors disabled:opacity-40">Previous</button>
          <button @click="currentPage < totalPages && (currentPage++, fetchSubmissions())" :disabled="currentPage >= totalPages" class="px-3 py-1.5 h-8 bg-primary rounded-lg text-[12px] font-sans font-medium text-foreground hover:opacity-90 transition-opacity disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>

    <!-- Mobile: Recent Activity (shown on mobile only) -->
    <div class="lg:hidden flex flex-col gap-3">
      <h2 class="font-mono text-base font-semibold text-foreground">Recent Activity</h2>
      <div v-if="recentActivity.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">description</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <h3 class="font-mono text-base font-semibold text-foreground">No submissions yet</h3>
          <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Submit your first tenant to get started</p>
        </div>
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in recentActivity"
          :key="item.name"
          class="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3"
        >
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-sm font-semibold text-foreground">{{ item.name }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ item.date }}</span>
          </div>
          <UiStatusPill :status="item.statusRaw" :label="item.status" />
        </div>
      </div>
    </div>
    <DashboardShareReportModal v-model="showShare" />
    </template>
  </div>
</template>
