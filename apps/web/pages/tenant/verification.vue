<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'tenant' })
useSeoMeta({ title: 'Verification Status — RentCred' })

const { getMySubmissions } = useTenantProfile()
const submissions = ref<any[]>([])
const loading = ref(true)

const statusSteps = ['pending', 'in_progress', 'field_visit', 'report_building', 'completed']

function stepIndex(status: string) {
  return statusSteps.indexOf(status)
}

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
    const result = await getMySubmissions()
    submissions.value = result.data || []
  } catch {
    // No submissions
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="font-mono text-xl lg:text-2xl font-bold text-foreground">Verification Status</h1>
      <p class="font-sans text-sm text-muted-foreground">Track the progress of your verification requests</p>
    </div>

    <!-- Submissions -->
    <div v-for="sub in submissions" :key="sub.id" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-5 shadow-sm">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-0.5">
          <span class="font-sans text-[15px] font-medium text-foreground">{{ sub.propertyAddress }}</span>
          <span class="font-sans text-[13px] text-muted-foreground">{{ sub.agent?.name }} &bull; {{ new Date(sub.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClasses(sub.status)">
          {{ SUBMISSION_STATUS_LABELS[sub.status] || sub.status }}
        </span>
      </div>

      <!-- Progress Timeline -->
      <div v-if="sub.status !== 'rejected'" class="flex items-center gap-0">
        <template v-for="(step, i) in statusSteps" :key="step">
          <div class="flex flex-col items-center gap-1">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-[14px]"
              :class="stepIndex(sub.status) >= i
                ? 'bg-[#DFE6E1] text-[#004D1A]'
                : 'bg-[#E7E8E5] text-muted-foreground'"
            >
              <span class="material-symbols-rounded text-[18px]">
                {{ stepIndex(sub.status) > i ? 'check' : stepIndex(sub.status) === i ? 'pending' : 'circle' }}
              </span>
            </div>
            <span class="font-sans text-[10px] text-muted-foreground text-center w-16 leading-tight">
              {{ SUBMISSION_STATUS_LABELS[step] || step }}
            </span>
          </div>
          <div v-if="i < statusSteps.length - 1" class="flex-1 h-0.5 -mt-5"
            :class="stepIndex(sub.status) > i ? 'bg-[#004D1A]' : 'bg-[#E7E8E5]'"
          />
        </template>
      </div>

      <!-- Verification Checklist Summary -->
      <div v-if="sub.verificationChecklist" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div v-for="(checked, label) in {
          'Identity': sub.verificationChecklist.identityVerified,
          'Employment': sub.verificationChecklist.employmentVerified,
          'References': sub.verificationChecklist.referencesVerified,
          'Address': sub.verificationChecklist.addressVerified,
          'Criminal': sub.verificationChecklist.criminalCheckDone,
          'Field Visit': sub.verificationChecklist.fieldVisitCompleted,
        }" :key="label" class="flex items-center gap-1.5">
          <span class="material-symbols-rounded text-[16px]" :class="checked ? 'text-[#004D1A]' : 'text-muted-foreground'">
            {{ checked ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <span class="font-sans text-[12px]" :class="checked ? 'text-foreground' : 'text-muted-foreground'">{{ label }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && submissions.length === 0" class="bg-white border border-border rounded-xl p-8 flex flex-col items-center gap-4 text-center">
      <span class="material-symbols-rounded text-[48px] text-muted-foreground">search_off</span>
      <h3 class="font-mono text-lg font-semibold text-foreground">No Verifications Yet</h3>
      <p class="font-sans text-sm text-muted-foreground max-w-[400px]">You'll see verification requests here when an agent submits you for tenant screening.</p>
    </div>
  </div>
</template>
