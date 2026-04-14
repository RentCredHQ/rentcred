<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'tenant' })
useSeoMeta({ title: 'Dashboard — RentCred Tenant' })

const { getProfileStatus, getMySubmissions } = useTenantProfile()

const profileStatus = ref<any>(null)
const submissions = ref<any[]>([])
const loading = ref(true)

const completionSteps = computed(() => {
  if (!profileStatus.value) return []
  return [
    { label: 'Personal Information', done: profileStatus.value.step1_personal, step: 1, icon: 'person' },
    { label: 'Employment Details', done: profileStatus.value.step2_employment, step: 2, icon: 'work' },
    { label: 'References', done: profileStatus.value.step3_references, step: 3, icon: 'group' },
    { label: 'Documents', done: profileStatus.value.step4_documents, step: 4, icon: 'upload_file' },
    { label: 'NDPR Consent', done: profileStatus.value.consentGiven, step: 5, icon: 'verified_user' },
  ]
})

const completionPercent = computed(() => {
  if (!profileStatus.value) return 0
  const steps = completionSteps.value
  const done = steps.filter(s => s.done).length
  return Math.round((done / steps.length) * 100)
})

const nextIncompleteStep = computed(() => {
  const step = completionSteps.value.find(s => !s.done)
  return step ? step.step : null
})

const activeVerifications = computed(() =>
  submissions.value.filter(s => s.status !== 'completed' && s.status !== 'rejected').length
)

const completedReports = computed(() =>
  submissions.value.filter(s => s.report?.status === 'approved').length
)

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'completed': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'rejected': return 'bg-red-50 text-red-700'
    case 'field_visit': return 'bg-blue-50 text-blue-600'
    default: return 'bg-[#E9E3D8] text-[#804200]'
  }
}

onMounted(async () => {
  try {
    const [status, subs] = await Promise.all([
      getProfileStatus(),
      getMySubmissions({ limit: 5 }),
    ])
    profileStatus.value = status
    submissions.value = subs.data || []
  } catch {
    // Profile may not exist yet
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Mobile greeting -->
    <div class="lg:hidden flex flex-col gap-1">
      <h1 class="font-sans text-xl font-semibold text-foreground">Your Dashboard</h1>
      <span class="font-sans text-[13px] text-muted-foreground">Tenant Portal</span>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Profile Completion -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">Profile Completion</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">person</span>
        </div>
        <span class="font-mono text-[28px] font-bold text-foreground">{{ completionPercent }}%</span>
        <div class="h-1.5 bg-[#E7E8E5] rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: `${completionPercent}%` }" />
        </div>
        <NuxtLink v-if="completionPercent < 100 && nextIncompleteStep" :to="`/tenant/profile/${nextIncompleteStep}`" class="font-sans text-[13px] text-primary font-medium hover:underline">
          Continue Profile
        </NuxtLink>
        <span v-else-if="completionPercent === 100" class="font-sans text-[13px] text-[#004D1A] font-medium">Complete</span>
      </div>

      <!-- Active Verifications -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">Active Verifications</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">verified</span>
        </div>
        <span class="font-mono text-[28px] font-bold text-foreground">{{ activeVerifications }}</span>
        <NuxtLink to="/tenant/verification" class="font-sans text-[13px] text-primary font-medium hover:underline">View Status</NuxtLink>
      </div>

      <!-- Reports Available -->
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">Reports Available</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">description</span>
        </div>
        <span class="font-mono text-[28px] font-bold text-foreground">{{ completedReports }}</span>
        <NuxtLink to="/tenant/reports" class="font-sans text-[13px] text-primary font-medium hover:underline">View Reports</NuxtLink>
      </div>
    </div>

    <!-- Profile Completion Checklist -->
    <div v-if="profileStatus && completionPercent < 100" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-4 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="font-mono text-base font-semibold text-foreground">Complete Your Profile</h2>
        <span class="font-sans text-[13px] text-muted-foreground">{{ completionSteps.filter(s => s.done).length }}/{{ completionSteps.length }} done</span>
      </div>

      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="step in completionSteps" :key="step.step"
          :to="`/tenant/profile/${step.step}`"
          class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface/30 transition-colors"
        >
          <span class="material-symbols-rounded text-[22px]" :class="step.done ? 'text-[#004D1A]' : 'text-muted-foreground'">
            {{ step.done ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <div class="flex-1">
            <span class="font-sans text-[14px]" :class="step.done ? 'text-muted-foreground' : 'text-foreground font-medium'">{{ step.label }}</span>
          </div>
          <span v-if="!step.done" class="material-symbols-rounded text-[16px] text-muted-foreground">chevron_right</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Verifications -->
    <div v-if="submissions.length > 0" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-4 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="font-mono text-base font-semibold text-foreground">Recent Verifications</h2>
        <NuxtLink to="/tenant/verification" class="font-sans text-[13px] text-primary font-medium hover:underline">View all</NuxtLink>
      </div>

      <div class="flex flex-col divide-y divide-border">
        <div v-for="sub in submissions" :key="sub.id" class="flex items-center justify-between py-3">
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[14px] font-medium text-foreground">{{ sub.propertyAddress }}</span>
            <span class="font-sans text-[12px] text-muted-foreground">{{ sub.agent?.name }} &bull; {{ new Date(sub.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
          </div>
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClasses(sub.status)">
            {{ SUBMISSION_STATUS_LABELS[sub.status] || sub.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && submissions.length === 0 && completionPercent === 100" class="bg-white border border-border rounded-xl p-8 flex flex-col items-center gap-4 text-center">
      <span class="material-symbols-rounded text-[48px] text-muted-foreground">hourglass_empty</span>
      <h3 class="font-mono text-lg font-semibold text-foreground">No Verifications Yet</h3>
      <p class="font-sans text-sm text-muted-foreground max-w-[400px]">Your profile is complete. You'll see verification requests here when an agent submits you for screening.</p>
    </div>
  </div>
</template>
