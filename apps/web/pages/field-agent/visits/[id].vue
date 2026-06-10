<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
const route = useRoute()
const visitId = route.params.id as string
const { getSubmission } = useSubmissions()

const visit = ref<any>(null)
const checklist = ref<string[]>([])
const loading = ref(true)

const CHECKLIST_LABELS: Record<string, string> = {
  identityVerified: 'Identity Verification',
  employmentVerified: 'Employment Verification',
  referencesVerified: 'References Check',
  addressVerified: 'Address Verification',
  criminalCheckDone: 'Criminal Background Check',
  fieldVisitCompleted: 'Field Visit',
}

const hasVisitReport = computed(() => {
  return visit.value?.fieldVisits?.length > 0
})

const assignmentStatus = computed(() => {
  return visit.value?.fieldAssignments?.[0]?.status || 'assigned'
})

const caseCompleted = computed(() => {
  const s = visit.value?.status
  return s === 'completed' || s === 'report_building'
})

const visitDone = computed(() => {
  return hasVisitReport.value || assignmentStatus.value === 'completed' || caseCompleted.value
})

onMounted(async () => {
  try {
    const res = await getSubmission(visitId)
    visit.value = res.data ?? res
    const vc = visit.value?.verificationChecklist ?? {}
    checklist.value = Object.entries(CHECKLIST_LABELS).map(([key, label]) => ({
      key,
      label,
      checked: vc[key] === true,
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <button @click="navigateTo('/field-agent')" class="flex items-center gap-2 text-foreground">
        <span class="material-symbols-rounded text-[20px]">arrow_back</span>
        <span class="font-mono text-base font-semibold">Visit Details</span>
      </button>
      <span class="font-mono text-[11px] text-muted-foreground">{{ visit?.id }}</span>
    </div>
    <template v-if="loading">
      <div class="flex items-center justify-center py-12">
        <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
      </div>
    </template>
    <template v-else-if="visit">
    <span class="inline-flex self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-st-amber-bg text-st-amber-text">{{ visit.status }}</span>
    <div class="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <span class="font-sans text-base font-medium text-foreground">{{ visit.tenantName }}</span>
      <span class="font-sans text-[13px] text-muted-foreground">{{ visit.propertyType }}</span>
      <div class="flex items-center gap-2 text-[13px] text-muted-foreground font-sans">
        <span class="material-symbols-rounded text-[16px]">location_on</span>
        {{ visit.propertyAddress }}
      </div>
      <div v-if="visit.fieldAssignments?.[0]?.scheduledDate || visit.createdAt" class="flex items-center gap-2 text-[13px] text-muted-foreground font-sans">
        <span class="material-symbols-rounded text-[16px]">calendar_today</span>
        {{ visit.fieldAssignments?.[0]?.scheduledDate ? new Date(visit.fieldAssignments[0].scheduledDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(visit.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}
      </div>
    </div>
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div v-for="(item, i) in [
        { label: 'Agent', value: visit.agent?.name ?? '—' },
        { label: 'Submitted', value: visit.createdAt ? new Date(visit.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
        { label: 'Tenant Phone', value: visit.tenantPhone ?? '—' },
      ]" :key="item.label" class="flex items-center justify-between px-4 py-3" :class="i < 2 ? 'border-b border-border' : ''">
        <span class="font-sans text-[13px] text-muted-foreground">{{ item.label }}</span>
        <span class="font-sans text-[13px] text-foreground">{{ item.value }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-mono text-[13px] font-semibold text-foreground">Verification Checklist</span>
      <div class="bg-card border border-border rounded-xl overflow-hidden">
        <div v-for="(item, i) in checklist" :key="item.key" class="flex items-center gap-3 px-4 py-3.5" :class="i < checklist.length - 1 ? 'border-b border-border' : ''">
          <span class="material-symbols-rounded text-[20px]" :class="item.checked ? 'text-st-green-text' : 'text-muted-foreground'">
            {{ item.checked ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <span class="font-sans text-[13px] text-foreground">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Show submit button only if visit is not done -->
    <NuxtLink v-if="!visitDone" :to="`/field-agent/visits/${visitId}/submit`"
      class="flex items-center justify-center gap-2 h-12 bg-primary text-foreground rounded-xl font-mono text-sm font-semibold">
      <span class="material-symbols-rounded text-[18px]">assignment_turned_in</span>
      Submit Visit Report
    </NuxtLink>

    <!-- Show completed state -->
    <div v-else class="flex items-center justify-center gap-2 h-12 bg-st-green-bg text-st-green-text rounded-xl font-mono text-sm font-semibold">
      <span class="material-symbols-rounded text-[18px]">check_circle</span>
      {{ hasVisitReport ? 'Visit Report Submitted' : 'Case Completed' }}
    </div>
    </template>
  </div>
</template>
