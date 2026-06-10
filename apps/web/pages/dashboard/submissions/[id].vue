<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'dashboard' })
const route = useRoute()
const caseId = computed(() => route.params.id as string)

useSeoMeta({ title: `Case ${caseId.value} — RentCred` })

const { getSubmission, updateSubmissionStatus } = useSubmissions()
const { shareReport } = useReports()
const { success, error: showError, info } = useToast()

const loading = ref(true)
const hasReport = ref(false)
const sharingReport = ref(false)

function getStatusStyle(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
    in_progress: { bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    field_visit: { bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    report_building: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
  }
  return map[status] || { bg: 'bg-[#E7E8E5]', text: 'text-foreground' }
}

const caseData = ref({
  name: '',
  caseId: '',
  package: '',
  status: '',
  rawStatus: '',
  statusBg: '',
  statusText: '',
  phone: '',
  email: '',
  address: '',
  submitted: '',
  propertyType: '',
  bedrooms: 0,
  annualRent: 0,
  state: '',
  lga: '',
  neighborhood: '',
  landlordName: '',
  landlordPhone: '',
  propertyCondition: '',
  propertyImages: [] as string[],
  fieldAgent: '',
  scheduledDate: '',
})

const CHECKLIST_LABELS: Record<string, string> = {
  identityVerified: 'Identity Check',
  employmentVerified: 'Employment Verification',
  referencesVerified: 'References Check',
  addressVerified: 'Address Verification',
  criminalCheckDone: 'Criminal Background Check',
  fieldVisitCompleted: 'Field Visit',
}

const steps = ref<{ name: string; status: string; date: string; icon: string; iconColor: string; dateColor: string }[]>([])

function buildSteps(submission: any) {
  const checklist = submission.verificationChecklist || {}
  return Object.entries(CHECKLIST_LABELS).map(([key, name]) => {
    const val = checklist[key]
    if (val === true) {
      return { name, status: 'completed', date: 'Completed', icon: 'check_circle', iconColor: 'text-[#004D1A]', dateColor: 'text-muted-foreground' }
    } else if (val === 'in_progress') {
      return { name, status: 'in_progress', date: 'In progress', icon: 'pending', iconColor: 'text-[#804200]', dateColor: 'text-[#804200]' }
    }
    return { name, status: 'pending', date: 'Not started', icon: 'radio_button_unchecked', iconColor: 'text-muted-foreground', dateColor: 'text-muted-foreground' }
  })
}

async function handleShareReport() {
  if (!hasReport.value) return
  sharingReport.value = true
  try {
    const res = await shareReport(caseId.value)
    try { await navigator.clipboard.writeText(res.shareUrl) } catch { /* clipboard may be blocked */ }
    success('Report link copied — ready to share')
  } catch (e: any) {
    showError(e.data?.message || 'Failed to share report')
  } finally {
    sharingReport.value = false
  }
}

function handleResendInvite() {
  // TODO: Wire to email service when available
  info('Invite resend is not available yet — email service required')
}

async function handleCancelCase() {
  if (!confirm('Are you sure you want to cancel this case? This action cannot be undone.')) return
  try {
    await updateSubmissionStatus(caseId.value, 'rejected')
    success('Case cancelled')
    navigateTo('/dashboard/submissions')
  } catch (e: any) {
    showError(e.data?.message || 'Failed to cancel case')
  }
}

onMounted(async () => {
  try {
    const res = await getSubmission(caseId.value)
    const s = res.data ?? res
    const style = getStatusStyle(s.status)
    const latestAssignment = s.fieldAssignments?.[0]
    caseData.value = {
      name: s.tenantName,
      caseId: s.id,
      package: s.propertyType || 'Standard',
      status: SUBMISSION_STATUS_LABELS[s.status] || s.status,
      rawStatus: s.status || '',
      statusBg: style.bg,
      statusText: style.text,
      phone: s.tenantPhone || '',
      email: s.tenantEmail || '',
      address: s.propertyAddress || '',
      submitted: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      propertyType: s.propertyType || '',
      bedrooms: s.bedrooms || 0,
      annualRent: s.annualRent || 0,
      state: s.state || '',
      lga: s.lga || '',
      neighborhood: s.neighborhood || '',
      landlordName: s.landlordName || '',
      landlordPhone: s.landlordPhone || '',
      propertyCondition: s.propertyCondition || '',
      propertyImages: s.propertyImages || [],
      fieldAgent: latestAssignment?.fieldAgent?.name || '',
      scheduledDate: latestAssignment?.scheduledDate ? new Date(latestAssignment.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
    }
    steps.value = buildSteps(s)
    hasReport.value = s.status === 'completed' || !!s.report
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
    <!-- Breadcrumb -->
    <div class="flex items-center gap-1.5">
      <NuxtLink to="/dashboard/submissions" class="font-sans text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Submissions</NuxtLink>
      <span class="material-symbols-rounded text-[16px] text-muted-foreground">chevron_right</span>
      <span class="font-mono text-[13px] font-medium text-foreground">{{ caseData.caseId }}</span>
    </div>

    <!-- Header -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-3 flex-wrap">
        <h1 class="font-mono text-xl lg:text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">{{ caseData.name }}</h1>
        <UiStatusPill :status="caseData.status" :label="caseData.status" />
      </div>
      <span class="font-mono text-[13px] text-muted-foreground">{{ caseData.caseId }}  ·  {{ caseData.package }} Package</span>
    </div>

    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Timeline -->
      <div class="flex-1">
        <div class="bg-white border-[1.5px] border-border rounded-lg p-5 lg:p-6 flex flex-col gap-5">
          <h2 class="font-mono text-base font-semibold text-foreground">Verification Progress</h2>

          <template v-for="(step, index) in steps" :key="step.name">
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[22px]" :class="step.iconColor">{{ step.icon }}</span>
              <div class="flex flex-col gap-0.5">
                <span class="font-sans text-[15px] font-medium" :class="step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'">{{ step.name }}</span>
                <span class="font-sans text-[13px]" :class="step.dateColor">{{ step.date }}</span>
              </div>
            </div>
            <hr v-if="index < steps.length - 1" class="border-border" />
          </template>
        </div>
      </div>

      <!-- Right: Info + Actions -->
      <div class="w-full lg:w-[340px] flex flex-col gap-4">
        <!-- Tenant Info -->
        <div class="bg-white border-[1.5px] border-border rounded-lg p-5 lg:p-6 flex flex-col gap-4">
          <h2 class="font-mono text-base font-semibold text-foreground">Tenant Information</h2>

          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PHONE</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.phone }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">EMAIL</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.email }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PROPERTY ADDRESS</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.address }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">SUBMITTED</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.submitted }}</span>
          </div>
        </div>

        <!-- Assignment Info -->
        <div v-if="caseData.fieldAgent" class="bg-white border-[1.5px] border-border rounded-lg p-5 lg:p-6 flex flex-col gap-4">
          <h2 class="font-mono text-base font-semibold text-foreground">Field Assignment</h2>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">FIELD AGENT</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.fieldAgent }}</span>
          </div>
          <div v-if="caseData.scheduledDate" class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">SCHEDULED DATE</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.scheduledDate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="caseData.rawStatus === 'field_visit' ? 'bg-blue-500' : 'bg-[#004D1A]'" />
            <span class="font-sans text-[13px] text-muted-foreground">{{ caseData.rawStatus === 'field_visit' ? 'Visit in progress' : 'Agent assigned' }}</span>
          </div>
        </div>

        <!-- Property Details -->
        <div class="bg-white border-[1.5px] border-border rounded-lg p-5 lg:p-6 flex flex-col gap-4">
          <h2 class="font-mono text-base font-semibold text-foreground">Property Details</h2>

          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">TYPE</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.propertyType }} · {{ caseData.bedrooms }} bed{{ caseData.bedrooms !== 1 ? 's' : '' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">ANNUAL RENT</span>
            <span class="font-sans text-sm text-foreground">₦{{ caseData.annualRent.toLocaleString('en-NG') }}/yr</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">LOCATION</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.neighborhood }}, {{ caseData.lga }}, {{ caseData.state }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">LANDLORD</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.landlordName }}</span>
            <span class="font-sans text-[13px] text-muted-foreground">{{ caseData.landlordPhone }}</span>
          </div>
          <div v-if="caseData.propertyCondition" class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">CONDITION</span>
            <span class="font-sans text-sm text-foreground">{{ caseData.propertyCondition }}</span>
          </div>
          <div v-if="caseData.propertyImages.length > 0" class="flex flex-col gap-1.5">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PHOTOS</span>
            <div class="grid grid-cols-3 gap-1.5">
              <div v-for="(img, i) in caseData.propertyImages" :key="i" class="aspect-square rounded-lg overflow-hidden border border-border">
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white border-[1.5px] border-border rounded-lg p-5 lg:p-6 flex flex-col gap-3">
          <h2 class="font-mono text-base font-semibold text-foreground">Actions</h2>
          <button
            @click="handleShareReport"
            :disabled="!hasReport || sharingReport"
            class="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-foreground font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
            <span class="material-symbols-rounded text-[18px]">share</span>
            {{ sharingReport ? 'Sharing...' : 'Share Report' }}
          </button>
          <button @click="handleResendInvite" class="flex items-center justify-center gap-2 w-full py-2.5 border-[1.5px] border-border font-sans text-sm font-semibold text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[18px]">mail</span>
            Resend Invite
          </button>
          <button @click="handleCancelCase" class="font-sans text-sm font-medium text-[#D93C15] text-center hover:underline">Cancel Case</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
