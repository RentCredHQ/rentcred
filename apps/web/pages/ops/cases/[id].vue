<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

definePageMeta({ layout: 'ops' })

const route = useRoute()
const caseId = computed(() => route.params.id as string)

useSeoMeta({ title: `Case ${caseId.value} — RentCred Ops` })

const { getSubmission } = useSubmissions()
const { getAuditLogs } = useAuditLog()

const showReassign = ref(false)
const loading = ref(true)

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

onMounted(async () => {
  try {
    const [submissionRes, auditRes] = await Promise.all([
      getSubmission(caseId.value),
      getAuditLogs({ entityId: caseId.value, entityType: 'submission' }),
    ])

    const s = submissionRes.data ?? submissionRes
    const style = statusStyleMap[s.status] ?? { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' }

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
        name: s.agentName ?? s.agent?.businessName ?? '',
        contact: s.agent?.name ?? '',
        rc: s.agent?.rcNumber ?? '',
      },
      assignee: s.fieldAgentName ?? s.fieldAgent?.name ?? '—',
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

    // Map verification checklist
    const checklist = s.verificationChecklist ?? s.verificationResults ?? {}
    const checkLabels: Record<string, string> = {
      identityVerified: 'NIN Verification',
      addressVerified: 'Address Verification',
      employmentVerified: 'Employment Check',
      referencesVerified: 'Reference Check',
      criminalCheckClear: 'Criminal Check',
      fieldVisitCompleted: 'Field Visit',
    }
    checks.value = Object.entries(checkLabels).map(([key, label]) => {
      const val = checklist[key]
      if (val === true) return { label, status: 'Verified', icon: 'check_circle', color: 'text-[#004D1A]' }
      if (val === false) return { label, status: 'Failed', icon: 'cancel', color: 'text-[#8C1C00]' }
      return { label, status: 'Pending', icon: 'schedule', color: 'text-muted-foreground' }
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
})
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

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="font-mono text-xl font-bold text-foreground">{{ caseData.id }}</h1>
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[caseData.statusBg, caseData.statusText]">{{ caseData.status }}</span>
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[caseData.priorityBg, caseData.priorityText]">{{ caseData.priority }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button @click="showReassign = true" class="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[16px]">swap_horiz</span>
            Reassign
          </button>
          <button class="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
            <span class="material-symbols-rounded text-[16px]">edit_note</span>
            Update Status
          </button>
        </div>
      </div>
    </div>

    <!-- Meta Row -->
    <div class="flex items-center gap-6 text-[13px] font-sans text-muted-foreground">
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

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2/3) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Tenant Info -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Tenant Information</span>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
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
            <div class="col-span-2 flex flex-col gap-1">
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
          <div class="p-6 grid grid-cols-2 gap-4">
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
            <div class="col-span-2 flex flex-col gap-1">
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
            <div v-if="caseData.property.images.length > 0" class="col-span-2 flex flex-col gap-1.5">
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
            <div v-for="check in checks" :key="check.label" class="flex items-center justify-between px-6 py-3.5">
              <div class="flex items-center gap-3">
                <span class="material-symbols-rounded text-[20px]" :class="check.color">{{ check.icon }}</span>
                <span class="font-sans text-[13px] text-foreground">{{ check.label }}</span>
              </div>
              <span class="font-mono text-[12px] font-semibold" :class="check.color">{{ check.status }}</span>
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
              <span class="font-mono text-[13px] font-semibold text-foreground">CN</span>
            </div>
            <div class="flex flex-col gap-px">
              <span class="font-sans text-[13px] font-medium text-foreground">{{ caseData.assignee }}</span>
              <span class="font-sans text-[11px] text-muted-foreground">Lagos · Active 10 min ago</span>
            </div>
          </div>
        </div>

        <!-- Documents -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-foreground">Documents</span>
          </div>
          <div class="divide-y divide-border">
            <div class="flex items-center gap-3 px-6 py-3">
              <span class="material-symbols-rounded text-[20px] text-muted-foreground">description</span>
              <div class="flex-1 flex flex-col">
                <span class="font-sans text-[13px] text-foreground">NIN Slip</span>
                <span class="font-sans text-[11px] text-muted-foreground">Uploaded Mar 10</span>
              </div>
              <span class="material-symbols-rounded text-[16px] text-muted-foreground hover:text-foreground cursor-pointer">download</span>
            </div>
            <div class="flex items-center gap-3 px-6 py-3">
              <span class="material-symbols-rounded text-[20px] text-muted-foreground">description</span>
              <div class="flex-1 flex flex-col">
                <span class="font-sans text-[13px] text-foreground">Utility Bill</span>
                <span class="font-sans text-[11px] text-muted-foreground">Uploaded Mar 10</span>
              </div>
              <span class="material-symbols-rounded text-[16px] text-muted-foreground hover:text-foreground cursor-pointer">download</span>
            </div>
            <div class="flex items-center gap-3 px-6 py-3">
              <span class="material-symbols-rounded text-[20px] text-muted-foreground">description</span>
              <div class="flex-1 flex flex-col">
                <span class="font-sans text-[13px] text-foreground">Employment Letter</span>
                <span class="font-sans text-[11px] text-muted-foreground">Uploaded Mar 10</span>
              </div>
              <span class="material-symbols-rounded text-[16px] text-muted-foreground hover:text-foreground cursor-pointer">download</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Case Reassign Modal -->
    <OpsCaseReassignModal v-model="showReassign" />
  </div>
</template>
