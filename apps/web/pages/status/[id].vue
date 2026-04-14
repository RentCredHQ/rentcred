<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const caseId = computed(() => route.params.id as string)

useSeoMeta({ title: () => `Case ${caseId.value} — Status Tracker — RentCred` })

interface Step {
  title: string
  detail: string
  status: 'complete' | 'in_progress' | 'pending'
  icon: string
}

const caseData = ref({
  id: 'RC-2026-00412',
  tenantName: 'Adebayo Okonkwo',
  submitted: 'March 5, 2026',
  property: '15B Admiralty Way, Lekki',
  landlord: 'Nwosu Properties Ltd',
  agent: 'Amara Okafor',
  estimatedCompletion: 'March 12, 2026',
  overallStatus: 'In Progress',
})

const steps = ref<Step[]>([
  { title: 'Case Submitted', detail: 'Mar 5, 2026 · 10:23 AM · Case created by Agent Amara Okafor', status: 'complete', icon: 'check' },
  { title: 'Identity Verification', detail: 'Mar 6, 2026 · NIN & BVN confirmed · Biometric match 98.7%', status: 'complete', icon: 'check' },
  { title: 'Employment Verification', detail: 'In progress · Awaiting employer callback from GTBank HR', status: 'in_progress', icon: 'pending' },
  { title: 'Reference Checks', detail: 'Pending · Will begin after employment check', status: 'pending', icon: 'dot' },
  { title: 'Report Generation', detail: 'Pending · Final report generated upon completion of all checks', status: 'pending', icon: 'dot' },
])

const completedSteps = computed(() => steps.value.filter(s => s.status === 'complete').length)

function statusBadgeClass(status: string) {
  switch (status) {
    case 'complete': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'in_progress': return 'bg-[#DFDFE6] text-[#000066]'
    default: return 'bg-[#E7E8E5] text-muted-foreground'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'complete': return 'Complete'
    case 'in_progress': return 'In Progress'
    default: return 'Pending'
  }
}

function circleClass(status: string) {
  switch (status) {
    case 'complete': return 'bg-[#DFE6E1]'
    case 'in_progress': return 'bg-primary'
    default: return 'bg-[#E7E8E5]'
  }
}

function iconColor(status: string) {
  switch (status) {
    case 'complete': return 'text-[#004D1A]'
    case 'in_progress': return 'text-foreground'
    default: return 'text-muted-foreground'
  }
}
</script>

<template>
  <div>
    <!-- Hero Banner -->
    <section class="bg-[#0D0D0D] px-5 lg:px-20 py-10 lg:py-12">
      <div class="max-w-[1440px] mx-auto flex flex-col items-center gap-3">
        <span class="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider">VERIFICATION STATUS</span>
        <h1 class="font-mono text-2xl lg:text-[32px] font-bold text-white">Case {{ caseData.id }}</h1>
        <p class="font-sans text-[15px] text-[#7A7A7A]">{{ caseData.tenantName }} · Submitted {{ caseData.submitted }}</p>
        <NuxtLink to="/status" class="mt-2 font-sans text-[13px] font-medium text-primary hover:underline">← Track another case</NuxtLink>
      </div>
    </section>

    <!-- Main Content -->
    <section class="bg-background px-5 lg:px-20 py-8 lg:py-12">
      <div class="max-w-[1200px] mx-auto flex flex-col gap-8">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-1">
            <span class="font-sans text-[12px] text-muted-foreground">Overall Status</span>
            <span class="inline-block w-fit px-3 py-1 rounded-full text-[12px] font-semibold font-mono bg-[#DFDFE6] text-[#000066]">{{ caseData.overallStatus }}</span>
          </div>
          <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-1">
            <span class="font-sans text-[12px] text-muted-foreground">Completion</span>
            <span class="font-mono text-xl font-bold text-foreground">{{ completedSteps }} of {{ steps.length }} steps</span>
          </div>
          <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-1">
            <span class="font-sans text-[12px] text-muted-foreground">Estimated Completion</span>
            <span class="font-mono text-xl font-bold text-foreground">{{ caseData.estimatedCompletion }}</span>
          </div>
          <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-1">
            <span class="font-sans text-[12px] text-muted-foreground">Assigned Agent</span>
            <span class="font-mono text-xl font-bold text-foreground">{{ caseData.agent }}</span>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Timeline Card -->
          <div class="flex-1 bg-white border border-border rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-7 py-5 border-b border-border">
              <h2 class="font-mono text-base font-bold text-foreground">Verification Progress</h2>
              <span class="font-sans text-[13px] text-muted-foreground">{{ completedSteps }} of {{ steps.length }} checks complete</span>
            </div>
            <!-- Progress Bar -->
            <div class="px-7 pt-4">
              <div class="w-full h-1.5 bg-[#E7E8E5] rounded-full">
                <div class="h-1.5 bg-primary rounded-full transition-all" :style="{ width: `${(completedSteps / steps.length) * 100}%` }" />
              </div>
            </div>
            <!-- Steps -->
            <div class="flex flex-col px-7 py-4">
              <template v-for="(step, i) in steps" :key="step.title">
                <div v-if="i > 0" class="h-px bg-border" />
                <div class="flex items-center gap-4 py-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="circleClass(step.status)">
                    <span v-if="step.status !== 'pending'" class="material-symbols-rounded text-[18px]" :class="iconColor(step.status)">{{ step.icon }}</span>
                    <div v-else class="w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                  <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span class="font-mono text-sm" :class="step.status === 'pending' ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground'">{{ step.title }}</span>
                    <span class="font-sans text-[12px] leading-snug" :class="step.status === 'in_progress' ? 'text-primary font-medium' : 'text-muted-foreground'">{{ step.detail }}</span>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[11px] font-semibold font-mono flex-shrink-0" :class="statusBadgeClass(step.status)">{{ statusLabel(step.status) }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="w-full lg:w-[340px] flex flex-col gap-5">
            <!-- Case Details -->
            <div class="bg-white border border-border rounded-xl overflow-hidden">
              <div class="px-5 py-4 border-b border-border">
                <h3 class="font-mono text-sm font-semibold text-foreground">Case Details</h3>
              </div>
              <div class="flex flex-col gap-4 p-5">
                <div class="flex justify-between"><span class="font-sans text-[12px] text-muted-foreground">Case ID</span><span class="font-mono text-[12px] font-semibold text-foreground">{{ caseData.id }}</span></div>
                <div class="flex justify-between"><span class="font-sans text-[12px] text-muted-foreground">Tenant Name</span><span class="font-sans text-[12px] font-medium text-foreground">{{ caseData.tenantName }}</span></div>
                <div class="flex justify-between"><span class="font-sans text-[12px] text-muted-foreground">Submitted</span><span class="font-sans text-[12px] font-medium text-foreground">{{ caseData.submitted }}</span></div>
                <div class="flex justify-between"><span class="font-sans text-[12px] text-muted-foreground">Property</span><span class="font-sans text-[12px] font-medium text-foreground">{{ caseData.property }}</span></div>
                <div class="flex justify-between"><span class="font-sans text-[12px] text-muted-foreground">Landlord</span><span class="font-sans text-[12px] font-medium text-foreground">{{ caseData.landlord }}</span></div>
              </div>
            </div>

            <!-- Help Card -->
            <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
              <h3 class="font-mono text-sm font-semibold text-foreground">Need Help?</h3>
              <p class="font-sans text-[12px] text-muted-foreground leading-relaxed">
                If you have questions about your verification, please contact the requesting agent or reach out to our support team.
              </p>
              <NuxtLink to="/contact" class="w-full py-2.5 border border-border rounded-lg font-sans text-[13px] font-medium text-foreground text-center hover:bg-background transition-colors">
                Contact Support
              </NuxtLink>
            </div>

            <!-- Notification Card -->
            <div class="bg-[#DFDFE6] rounded-xl p-5 flex flex-col gap-3">
              <span class="material-symbols-rounded text-[24px] text-[#000066]">notifications_active</span>
              <h3 class="font-mono text-sm font-semibold text-[#000066]">Get Updates</h3>
              <p class="font-sans text-[12px] text-[#000066] leading-relaxed">
                You will receive an email notification at each verification milestone. Check your inbox for updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
