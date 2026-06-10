<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'ops' })

const route = useRoute()
const caseId = computed(() => route.params.id as string)

useSeoMeta({ title: `Case ${caseId.value} — RentCred Ops` })

const { getSubmission, updateSubmissionStatus } = useSubmissions()
const { getAuditLogs } = useAuditLog()
const { api } = useApi()
const { success, error: showError } = useToast()

const showReassign = ref(false)
const showStatusMenu = ref(false)
const statusUpdating = ref(false)
const generatingReport = ref(false)
const reportExists = ref(false)
const reportId = ref('')
const reportStatus = ref('')
const loading = ref(true)
const hasFieldAgent = ref(false)
const rawStatus = ref('')

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'rejected'],
  in_progress: ['field_visit', 'report_building', 'rejected'],
  field_visit: ['report_building', 'rejected'],
  report_building: ['completed', 'rejected'],
  completed: [],
  rejected: ['pending'],
}

const availableTransitions = computed(() => {
  return (VALID_TRANSITIONS[rawStatus.value] || []).map(s => ({
    value: s,
    label: SUBMISSION_STATUS_LABELS[s] ?? s,
    style: statusStyleMap[s] ?? { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  }))
})

async function handleStatusUpdate(newStatus: string) {
  statusUpdating.value = true
  try {
    await updateSubmissionStatus(caseId.value, newStatus)
    showStatusMenu.value = false
    await fetchCaseData()
    success(`Status updated to ${SUBMISSION_STATUS_LABELS[newStatus] ?? newStatus}`)
  } catch (e: any) {
    showError(e.data?.message || 'Failed to update status')
  } finally {
    statusUpdating.value = false
  }
}

async function generateReport() {
  generatingReport.value = true
  try {
    await api(`/reports/generate/${caseId.value}`, { method: 'POST' })
    await fetchCaseData()
    success('Report generated — ready for approval')
  } catch (e: any) {
    showError(e.data?.message || 'Failed to generate report')
  } finally {
    generatingReport.value = false
  }
}

async function approveReport() {
  try {
    await api(`/reports/${reportId.value}/review`, {
      method: 'PATCH',
      body: { status: 'approved', notes: 'Approved' },
    })
    await fetchCaseData()
    success('Report approved — agent and tenant notified')
  } catch (e: any) {
    showError(e.data?.message || 'Failed to approve report')
  }
}

async function toggleCheck(check: any) {
  const newValue = !check.checked
  try {
    await api(`/verification/checklist/${caseId.value}`, {
      method: 'PATCH',
      body: { [check.key]: newValue },
    })
    await fetchCaseData()
  } catch (e: any) {
    showError(e.data?.message || 'Failed to update checklist')
  }
}

const statusStyleMap: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  in_progress: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  field_visit: { bg: 'bg-blue-50', text: 'text-blue-600' },
  report_building: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
  rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
}

const caseData = ref({
  id: '',
  tenant: { name: '', phone: '', email: '', nin: '', address: '' },
  property: {
    type: '', bedrooms: 0, annualRent: 0, state: '', lga: '', neighborhood: '',
    landlordName: '', landlordPhone: '', condition: '', images: [] as string[],
  },
  agent: { name: '', contact: '', rc: '' },
  assignee: '',
  status: '',
  statusBg: '',
  statusText: '',
  priority: '—',
  priorityBg: 'bg-[#E9E3D8]',
  priorityText: 'text-[#804200]',
  created: '',
  updated: '',
  sla: '',
})

const checks = ref<any[]>([])
const timeline = ref<any[]>([])

const assigneeInitials = computed(() => {
  const name = caseData.value.assignee
  if (!name || name === '—') return '—'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

async function fetchCaseData() {
  loading.value = true
  try {
    const [submissionRes, auditRes] = await Promise.all([
      getSubmission(caseId.value),
      getAuditLogs({ entityId: caseId.value, entityType: 'submission' }),
    ])

    const s = submissionRes.data ?? submissionRes
    const style = statusStyleMap[s.status] ?? { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' }

    // Extract field agent from fieldAssignments array
    const latestAssignment = s.fieldAssignments?.[0]
    const fieldAgentName = latestAssignment?.fieldAgent?.name ?? ''

    caseData.value = {
      id: s.id,
      tenant: {
        name: s.tenantName ?? '',
        phone: s.tenantPhone ?? '',
        email: s.tenantEmail ?? '',
        nin: s.tenantNin ?? '',
        address: s.propertyAddress ?? '',
      },
      property: {
        type: s.propertyType ?? '',
        bedrooms: s.bedrooms ?? 0,
        annualRent: s.annualRent ?? 0,
        state: s.state ?? '',
        lga: s.lga ?? '',
        neighborhood: s.neighborhood ?? '',
        landlordName: s.landlordName ?? '',
        landlordPhone: s.landlordPhone ?? '',
        condition: s.propertyCondition ?? '',
        images: s.propertyImages ?? [],
      },
      agent: {
        name: s.agent?.name ?? '',
        contact: s.agent?.email ?? '',
        rc: '',
      },
      assignee: fieldAgentName || '—',
      status: SUBMISSION_STATUS_LABELS[s.status] ?? s.status,
      statusBg: style.bg,
      statusText: style.text,
      priority: s.priority ?? '—',
      priorityBg: 'bg-[#E9E3D8]',
      priorityText: 'text-[#804200]',
      created: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      updated: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      sla: s.sla ?? '',
    }
    rawStatus.value = s.status ?? ''
    reportExists.value = !!s.report
    reportId.value = s.report?.id ?? ''
    reportStatus.value = s.report?.status ?? ''
    const assigneeName = caseData.value.assignee
    hasFieldAgent.value = !!assigneeName && assigneeName !== '—' && assigneeName !== 'Unassigned'

    // Map verification checklist
    const checklist = s.verificationChecklist ?? {}
    const checkLabels: Record<string, string> = {
      identityVerified: 'NIN Verification',
      addressVerified: 'Address Verification',
      employmentVerified: 'Employment Check',
      referencesVerified: 'Reference Check',
      criminalCheckDone: 'Criminal Check',
      fieldVisitCompleted: 'Field Visit',
    }
    checks.value = Object.entries(checkLabels).map(([key, label]) => {
      const val = checklist[key]
      if (val === true) return { key, label, checked: true, status: 'Verified', icon: 'check_circle', color: 'text-[#004D1A]' }
      return { key, label, checked: false, status: 'Pending', icon: 'schedule', color: 'text-muted-foreground' }
    })

    // Map audit logs to timeline
    const logs = auditRes.data ?? []
    timeline.value = logs.map((log: any) => ({
      action: log.action ?? log.description ?? '',
      user: log.userName ?? log.user?.name ?? 'System',
      time: log.createdAt ? new Date(log.createdAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
}

// ── "Current action" model — always surface the single next move ──
const CASE_FLOW = ['pending', 'in_progress', 'field_visit', 'report_building', 'completed']
const stageIndex = computed(() => CASE_FLOW.indexOf(rawStatus.value))
const actionBusy = computed(() => statusUpdating.value || generatingReport.value)

interface NextAction {
  icon: string
  label: string
  desc: string
  cta: { text: string; run: () => void; approve?: boolean } | null
}

const nextAction = computed<NextAction>(() => {
  const who = caseData.value.assignee !== '—' ? caseData.value.assignee : 'The field agent'
  switch (rawStatus.value) {
    case 'pending':
      return hasFieldAgent.value
        ? { icon: 'play_arrow', label: 'Start verification', desc: 'A field agent is assigned. Begin verification to start working the checklist.', cta: { text: 'Start Verification', run: () => handleStatusUpdate('in_progress') } }
        : { icon: 'person_add', label: 'Assign a field agent', desc: 'This case is new. Assign a field agent to begin verification.', cta: { text: 'Assign Field Agent', run: () => { showReassign.value = true } } }
    case 'in_progress':
      return { icon: 'checklist', label: 'Complete the verification checklist', desc: 'Work through the checks below as evidence arrives. Send for a field visit if the address needs physical confirmation.', cta: { text: 'Send for Field Visit', run: () => handleStatusUpdate('field_visit') } }
    case 'field_visit':
      return { icon: 'person_pin_circle', label: 'Awaiting field visit report', desc: `${who} is verifying the property on-site. The visit report completes the checklist.`, cta: { text: 'Move to Report Building', run: () => handleStatusUpdate('report_building') } }
    case 'report_building':
      return reportExists.value
        ? { icon: 'rate_review', label: 'Approve the report', desc: 'A report is drafted and all checks are in. Review and approve it to publish to the agent.', cta: { text: 'Approve Report', run: approveReport, approve: true } }
        : { icon: 'auto_awesome', label: 'Generate the report', desc: 'All checks are complete. Generate the verification report, then approve it to publish.', cta: { text: 'Generate Report', run: generateReport } }
    case 'completed':
      return { icon: 'check_circle', label: 'Approved & published', desc: 'The report is approved. The agent and tenant have been notified.', cta: null }
    case 'rejected':
      return { icon: 'cancel', label: 'Case rejected', desc: 'This case was rejected. Reopen it to pending if it needs another look.', cta: { text: 'Reopen Case', run: () => handleStatusUpdate('pending') } }
    default:
      return { icon: 'pending', label: 'In progress', desc: '', cta: null }
  }
})

onMounted(fetchCaseData)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 text-[13px] font-sans text-muted-foreground">
        <NuxtLink to="/ops/cases" class="hover:text-foreground transition-colors">Cases</NuxtLink>
        <span class="material-symbols-rounded text-[14px]">chevron_right</span>
        <span class="text-foreground">{{ caseId }}</span>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-4">
          <h1 class="font-mono text-xl font-bold text-foreground">{{ caseData.id }}</h1>
          <UiStatusPill :status="rawStatus" :label="caseData.status" />
          <span v-if="caseData.priority && caseData.priority !== '—'" class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[caseData.priorityBg, caseData.priorityText]">{{ caseData.priority }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button @click="showReassign = true" class="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[16px]">{{ hasFieldAgent ? 'swap_horiz' : 'person_add' }}</span>
            {{ hasFieldAgent ? 'Reassign' : 'Assign Field Agent' }}
          </button>
          <div class="relative">
            <button
              v-if="availableTransitions.length > 0"
              @click="showStatusMenu = !showStatusMenu"
              :disabled="statusUpdating"
              class="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span class="material-symbols-rounded text-[16px]">edit_note</span>
              {{ statusUpdating ? 'Updating...' : 'Update Status' }}
            </button>
            <div v-if="showStatusMenu" class="absolute right-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20 py-1">
              <button
                v-for="t in availableTransitions"
                :key="t.value"
                @click="handleStatusUpdate(t.value)"
                class="w-full text-left px-4 py-2.5 text-[13px] font-sans hover:bg-surface transition-colors flex items-center gap-2"
              >
                <span class="inline-block w-2 h-2 rounded-full" :class="t.style.bg" />
                {{ t.label }}
              </button>
            </div>
            <div v-if="showStatusMenu" class="fixed inset-0 z-10" @click="showStatusMenu = false" />
          </div>
        </div>
      </div>
    </div>

    <!-- Meta Row -->
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-sans text-muted-foreground">
      <div class="flex items-center gap-1.5">
        <span class="material-symbols-rounded text-[16px]">person</span>
        Assigned: <span class="text-foreground font-medium">{{ caseData.assignee }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="material-symbols-rounded text-[16px]">calendar_today</span>
        Created: {{ caseData.created }}
      </div>
      <div class="flex items-center gap-1.5">
        <span class="material-symbols-rounded text-[16px]">timer</span>
        SLA: <span class="text-[#804200] font-medium">{{ caseData.sla }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="material-symbols-rounded text-[16px]">update</span>
        Updated: {{ caseData.updated }}
      </div>
    </div>

    <!-- Pipeline strip + Current Action — the "next move" model -->
    <div class="flex flex-col gap-4">
      <!-- Pipeline -->
      <div class="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-0 overflow-x-auto">
        <template v-for="(stage, i) in CASE_FLOW" :key="stage">
          <div class="flex items-center gap-2 flex-shrink-0">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold flex-shrink-0"
              :class="rawStatus === 'rejected' ? 'bg-st-red-bg text-st-red-text'
                : i < stageIndex ? 'bg-st-green-bg text-st-green-text'
                : i === stageIndex ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-muted-foreground'"
            >
              <span v-if="i < stageIndex && rawStatus !== 'rejected'" class="material-symbols-rounded text-[13px]">check</span>
              <span v-else>{{ i + 1 }}</span>
            </span>
            <span
              class="font-sans text-[12px] whitespace-nowrap"
              :class="i === stageIndex && rawStatus !== 'rejected' ? 'text-foreground font-semibold' : 'text-muted-foreground'"
            >{{ SUBMISSION_STATUS_LABELS[stage] || stage }}</span>
          </div>
          <span v-if="i < CASE_FLOW.length - 1" class="w-5 h-px bg-border mx-1.5 flex-shrink-0" />
        </template>
      </div>

      <!-- Current Action -->
      <div
        class="bg-card rounded-xl p-5 flex flex-col sm:flex-row items-start gap-4"
        :class="rawStatus === 'completed' ? 'border border-st-green-text' : 'border-2 border-primary'"
      >
        <div
          class="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="rawStatus === 'completed' ? 'bg-st-green-bg' : 'bg-[#FF84001F]'"
        >
          <span class="material-symbols-rounded text-[24px]" :class="rawStatus === 'completed' ? 'text-st-green-text' : 'text-primary'">{{ nextAction.icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <span class="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground">Current action</span>
          <h2 class="font-mono text-[17px] font-bold text-foreground mt-1">{{ nextAction.label }}</h2>
          <p v-if="nextAction.desc" class="font-sans text-[13.5px] text-muted-foreground mt-1.5 max-w-[560px]">{{ nextAction.desc }}</p>
        </div>
        <button
          v-if="nextAction.cta"
          :disabled="actionBusy"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto justify-center"
          :class="nextAction.cta.approve ? '' : 'bg-primary !text-primary-foreground'"
          :style="nextAction.cta.approve ? 'background: var(--color-st-green-text)' : ''"
          @click="nextAction.cta.run()"
        >
          <span v-if="actionBusy" class="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
          <span v-else class="material-symbols-rounded text-[16px]">{{ nextAction.icon }}</span>
          {{ nextAction.cta.text }}
        </button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2/3) -->
      <div class="lg:sm:col-span-2 flex flex-col gap-6">
        <!-- Tenant Info -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Tenant Information</span>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">NAME</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.tenant.name }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">PHONE</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.tenant.phone }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">EMAIL</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.tenant.email }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">NIN</span>
              <span class="font-mono text-[13px] text-foreground">{{ caseData.tenant.nin }}</span>
            </div>
            <div class="sm:col-span-2 flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">ADDRESS</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.tenant.address }}</span>
            </div>
          </div>
        </div>

        <!-- Property Details -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Property Details</span>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">TYPE</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.property.type }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">BEDROOMS</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.property.bedrooms }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">ANNUAL RENT</span>
              <span class="font-sans text-[13px] text-foreground">₦{{ caseData.property.annualRent.toLocaleString('en-NG') }}/yr</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">CONDITION</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.property.condition || '—' }}</span>
            </div>
            <div class="sm:col-span-2 flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">LOCATION</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.property.neighborhood }}, {{ caseData.property.lga }}, {{ caseData.property.state }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">LANDLORD</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.property.landlordName }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">LANDLORD PHONE</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.property.landlordPhone }}</span>
            </div>
            <div v-if="caseData.property.images.length > 0" class="sm:col-span-2 flex flex-col gap-1.5">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">PHOTOS</span>
              <div class="flex gap-2 overflow-x-auto">
                <div v-for="(img, i) in caseData.property.images" :key="i" class="w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <img :src="img" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Checks -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Verification Checks</span>
          </div>
          <div class="divide-y divide-border">
            <template v-for="check in checks" :key="check.key">
              <!-- Field Visit is auto-verified by field agent, not clickable by ops -->
              <div v-if="check.key === 'fieldVisitCompleted'" class="flex items-center justify-between px-6 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-rounded text-[20px]" :class="check.color">{{ check.icon }}</span>
                  <div class="flex flex-col">
                    <span class="font-sans text-[13px] text-foreground">{{ check.label }}</span>
                    <span class="font-sans text-[11px] text-muted-foreground">{{ check.checked ? 'Completed by field agent' : 'Awaiting field agent visit report' }}</span>
                  </div>
                </div>
                <span class="font-mono text-[12px] font-semibold" :class="check.color">{{ check.status }}</span>
              </div>
              <!-- Other checks are clickable by ops -->
              <button v-else @click="toggleCheck(check)" class="flex items-center justify-between px-6 py-3.5 w-full text-left hover:bg-surface transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-rounded text-[20px]" :class="check.color">{{ check.icon }}</span>
                  <span class="font-sans text-[13px] text-foreground">{{ check.label }}</span>
                </div>
                <span class="font-mono text-[12px] font-semibold" :class="check.color">{{ check.status }}</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Report Section -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <span class="font-mono text-sm font-semibold text-foreground">Verification Report</span>
            <UiStatusPill v-if="reportExists" :status="reportStatus" />
          </div>
          <div class="px-6 py-5">
            <!-- No report yet -->
            <div v-if="!reportExists" class="flex flex-col items-center gap-3 py-4">
              <span class="material-symbols-rounded text-[32px] text-muted-foreground">description</span>
              <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">No report generated yet. Generate a report once all verification checks are complete.</p>
              <button
                @click="generateReport"
                :disabled="generatingReport"
                class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <span v-if="generatingReport" class="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
                <span v-else class="material-symbols-rounded text-[16px]">auto_awesome</span>
                {{ generatingReport ? 'Generating...' : 'Generate Report' }}
              </button>
            </div>

            <!-- Report exists -->
            <div v-else class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="font-sans text-sm text-foreground">Report ID: <span class="font-mono text-muted-foreground">{{ reportId.slice(0, 12) }}…</span></span>
              </div>
              <div class="flex items-center gap-3">
                <NuxtLink :to="`/ops/reports`" class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
                  <span class="material-symbols-rounded text-[16px]">visibility</span>
                  View Report
                </NuxtLink>
                <button
                  v-if="reportStatus === 'draft' || reportStatus === 'pending_approval'"
                  @click="approveReport"
                  class="flex items-center gap-2 px-4 py-2 bg-[#004D1A] text-white rounded-lg text-[13px] font-mono font-medium hover:opacity-90 transition-opacity"
                >
                  <span class="material-symbols-rounded text-[16px]">check_circle</span>
                  Approve Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Activity Timeline</span>
          </div>
          <div class="p-6">
            <div class="flex flex-col gap-4 pl-4 border-l-2 border-border">
              <div v-for="event in timeline" :key="event.time" class="flex flex-col gap-0.5 relative">
                <div class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-border" />
                <span class="font-sans text-[13px] text-foreground">{{ event.action }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-sans text-[11px] text-muted-foreground">{{ event.user }}</span>
                  <span class="font-sans text-[11px] text-muted-foreground">·</span>
                  <span class="font-sans text-[11px] text-muted-foreground">{{ event.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column (1/3) -->
      <div class="flex flex-col gap-6">
        <!-- Agent Info -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Requesting Agent</span>
          </div>
          <div class="p-6 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">BUSINESS</span>
              <span class="font-sans text-[13px] text-foreground font-medium">{{ caseData.agent.name }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">CONTACT</span>
              <span class="font-sans text-[13px] text-foreground">{{ caseData.agent.contact }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] text-muted-foreground tracking-wider">RC NUMBER</span>
              <span class="font-mono text-[13px] text-foreground">{{ caseData.agent.rc }}</span>
            </div>
          </div>
        </div>

        <!-- Field Agent -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Field Agent</span>
          </div>
          <div class="p-6 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span class="font-mono text-[13px] font-semibold text-foreground">{{ assigneeInitials }}</span>
            </div>
            <div class="flex flex-col gap-px">
              <span class="font-sans text-[13px] font-medium text-foreground">{{ caseData.assignee }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Case Reassign Modal -->
    <OpsCaseReassignModal v-model="showReassign" :submission-id="caseId" @reassigned="fetchCaseData" />
  </div>
</template>
