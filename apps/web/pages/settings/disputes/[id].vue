<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const disputeId = computed(() => route.params.id as string)

useSeoMeta({ title: () => `Dispute ${disputeId.value} — RentCred` })

const dispute = ref({
  id: 'DSP-0023',
  status: 'Open',
  statusBg: 'bg-[#E9E3D8]',
  statusText: 'text-[#804200]',
  priority: 'High',
  priorityBg: 'bg-[#E5DCDA]',
  priorityText: 'text-[#8C1C00]',
  caseId: 'RC-2026-00389',
  filedBy: 'Adesola Okafor',
  filedDate: 'March 10, 2026',
  category: 'Data Accuracy',
  subject: 'Employment verification data outdated',
  description: 'The employment verification data for this tenant appears to be outdated. The employer listed (Zenith Corp) no longer exists as of January 2026. The company was acquired by Sterling Holdings in Q4 2025, and the tenant has been employed by Sterling Holdings since.',
  timeline: [
    { date: 'Mar 10', time: '2:30 PM', title: 'Dispute filed', detail: 'Filed by Adesola Okafor citing employment data inaccuracy', icon: 'flag', color: 'bg-primary' },
    { date: 'Mar 10', time: '3:15 PM', title: 'Assigned to agent', detail: 'Case assigned to Funke Adeyemi for investigation', icon: 'person', color: 'bg-[#1A56DB]' },
    { date: 'Mar 11', time: '9:00 AM', title: 'Investigation started', detail: 'Agent began reviewing employment records and contacting employer', icon: 'search', color: 'bg-[#804200]' },
    { date: 'Mar 12', time: '11:30 AM', title: 'Evidence submitted', detail: 'Tenant provided acquisition letter from Sterling Holdings', icon: 'attach_file', color: 'bg-[#004D1A]' },
  ],
  info: {
    assignedTo: 'Funke Adeyemi',
    tenant: 'Adebayo Okonkwo',
    relatedCase: 'RC-2026-00389',
    sla: '48 hours (18h remaining)',
  },
})

const newComment = ref('')
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumb + Header -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 text-[13px] font-sans text-muted-foreground">
        <NuxtLink to="/settings/disputes" class="hover:text-foreground transition-colors">Disputes</NuxtLink>
        <span class="material-symbols-rounded text-[14px]">chevron_right</span>
        <span class="text-foreground font-medium">{{ dispute.id }}</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <NuxtLink to="/settings/disputes" class="lg:hidden">
            <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
          </NuxtLink>
          <h1 class="font-mono text-xl lg:text-2xl font-bold text-foreground">{{ dispute.id }}</h1>
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[dispute.statusBg, dispute.statusText]">{{ dispute.status }}</span>
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[dispute.priorityBg, dispute.priorityText]">{{ dispute.priority }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-[13px] font-sans font-medium text-foreground hover:bg-white transition-colors">
            <span class="material-symbols-rounded text-[16px]">edit</span>
            Update
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-[#004D1A] text-white rounded-lg text-[13px] font-sans font-medium hover:opacity-90 transition-opacity">
            <span class="material-symbols-rounded text-[16px]">check</span>
            Resolve
          </button>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Column -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Description Card -->
        <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
          <h2 class="font-mono text-[15px] font-semibold text-foreground">{{ dispute.subject }}</h2>
          <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-[12px] font-sans text-muted-foreground">
            <span>Filed by {{ dispute.filedBy }}</span>
            <span>{{ dispute.filedDate }}</span>
            <span class="inline-flex px-2 py-0.5 rounded bg-[#E7E8E5] text-[11px] font-medium text-foreground">{{ dispute.category }}</span>
          </div>
          <p class="font-sans text-[13px] text-foreground leading-relaxed">{{ dispute.description }}</p>
        </div>

        <!-- Timeline -->
        <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 class="font-mono text-[13px] font-semibold text-foreground tracking-wider uppercase">Activity Timeline</h3>
          <div class="flex flex-col gap-0">
            <div v-for="(event, idx) in dispute.timeline" :key="idx" class="flex gap-4">
              <!-- Timeline line + dot -->
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="event.color">
                  <span class="material-symbols-rounded text-[16px] text-white">{{ event.icon }}</span>
                </div>
                <div v-if="idx < dispute.timeline.length - 1" class="w-px flex-1 bg-border min-h-[24px]" />
              </div>
              <!-- Content -->
              <div class="pb-6">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="font-sans text-[13px] font-semibold text-foreground">{{ event.title }}</span>
                </div>
                <span class="font-sans text-[12px] text-muted-foreground block mb-1">{{ event.date }} · {{ event.time }}</span>
                <span class="font-sans text-[13px] text-foreground">{{ event.detail }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Comment -->
        <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
          <h3 class="font-mono text-[13px] font-semibold text-foreground">Add Comment</h3>
          <textarea
            v-model="newComment"
            placeholder="Type your comment..."
            class="w-full h-20 px-3 py-2.5 border border-border rounded-lg bg-background text-[13px] font-sans text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary"
          />
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 px-4 py-2 bg-primary text-foreground rounded-lg text-[13px] font-mono font-medium hover:opacity-90 transition-opacity">
              <span class="material-symbols-rounded text-[16px]">send</span>
              Post Comment
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 text-[13px] font-sans text-muted-foreground hover:text-foreground transition-colors">
              <span class="material-symbols-rounded text-[16px]">attach_file</span>
              Attach File
            </button>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col gap-4">
        <!-- Info Card -->
        <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 class="font-mono text-[13px] font-semibold text-foreground tracking-wider uppercase">Details</h3>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between">
              <span class="font-sans text-[12px] text-muted-foreground">Assigned To</span>
              <span class="font-sans text-[12px] font-medium text-foreground">{{ dispute.info.assignedTo }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-sans text-[12px] text-muted-foreground">Tenant</span>
              <span class="font-sans text-[12px] font-medium text-foreground">{{ dispute.info.tenant }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-sans text-[12px] text-muted-foreground">Related Case</span>
              <span class="font-mono text-[12px] font-medium text-primary">{{ dispute.info.relatedCase }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-sans text-[12px] text-muted-foreground">SLA</span>
              <span class="font-sans text-[12px] font-medium text-[#804200]">{{ dispute.info.sla }}</span>
            </div>
          </div>
        </div>

        <!-- Evidence Card -->
        <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
          <h3 class="font-mono text-[13px] font-semibold text-foreground tracking-wider uppercase">Evidence</h3>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-background transition-colors cursor-pointer">
              <span class="material-symbols-rounded text-[20px] text-muted-foreground">description</span>
              <div class="flex flex-col gap-px flex-1 min-w-0">
                <span class="font-sans text-[13px] font-medium text-foreground truncate">acquisition_letter.pdf</span>
                <span class="font-sans text-[11px] text-muted-foreground">342 KB · Mar 12</span>
              </div>
              <span class="material-symbols-rounded text-[16px] text-muted-foreground">download</span>
            </div>
            <div class="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-background transition-colors cursor-pointer">
              <span class="material-symbols-rounded text-[20px] text-muted-foreground">image</span>
              <div class="flex flex-col gap-px flex-1 min-w-0">
                <span class="font-sans text-[13px] font-medium text-foreground truncate">employment_record.png</span>
                <span class="font-sans text-[11px] text-muted-foreground">1.2 MB · Mar 12</span>
              </div>
              <span class="material-symbols-rounded text-[16px] text-muted-foreground">download</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
