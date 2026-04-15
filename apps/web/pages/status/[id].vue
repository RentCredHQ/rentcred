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
    case 'complete': return 'bg-[#004D1A]/10 text-[#004D1A]'
    case 'in_progress': return 'bg-[#FF8400]/10 text-[#FF8400]'
    default: return 'bg-card text-muted-foreground'
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
    case 'complete': return 'bg-[#004D1A] border-[#004D1A]'
    case 'in_progress': return 'bg-[#FF8400] border-[#FF8400]'
    default: return 'bg-transparent border-border'
  }
}
</script>

<template>
  <div>
    <!-- HERO (dark) -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-5">
          <span class="font-mono text-xs font-semibold text-[#FF8400] uppercase tracking-wider">VERIFICATION PROGRESS</span>
          <h1 class="font-mono text-2xl sm:text-3xl lg:text-[40px] font-bold text-white text-center">
            Case {{ caseData.id }}
          </h1>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <span class="inline-flex px-3 py-1 bg-[#FF8400]/10 text-[#FF8400] text-xs font-semibold font-mono">
              {{ caseData.overallStatus }}
            </span>
            <span class="font-sans text-sm text-[#7A7A7A]">Submitted {{ caseData.submitted }}</span>
          </div>
          <NuxtLink to="/status" class="mt-1 font-sans text-sm font-medium text-[#FF8400] hover:underline">
            ← Track another case
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CASE DETAILS (light) -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <!-- Left Column -->
          <div class="flex-1 flex flex-col gap-8">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-card border border-border p-5 flex flex-col gap-1.5">
                <span class="font-sans text-xs text-muted-foreground">Progress</span>
                <span class="font-mono text-xl font-bold text-foreground">{{ completedSteps }} of {{ steps.length }}</span>
                <div class="w-full h-1.5 bg-border mt-1">
                  <div class="h-1.5 bg-[#FF8400] transition-all" :style="{ width: `${(completedSteps / steps.length) * 100}%` }" />
                </div>
              </div>
              <div class="bg-card border border-border p-5 flex flex-col gap-1.5">
                <span class="font-sans text-xs text-muted-foreground">Estimated Completion</span>
                <span class="font-mono text-xl font-bold text-foreground">{{ caseData.estimatedCompletion }}</span>
              </div>
              <div class="bg-card border border-border p-5 flex flex-col gap-1.5">
                <span class="font-sans text-xs text-muted-foreground">Submitted</span>
                <span class="font-mono text-xl font-bold text-foreground">{{ caseData.submitted }}</span>
              </div>
              <div class="bg-card border border-border p-5 flex flex-col gap-1.5">
                <span class="font-sans text-xs text-muted-foreground">Agent</span>
                <span class="font-mono text-xl font-bold text-foreground">{{ caseData.agent }}</span>
              </div>
            </div>

            <!-- Timeline -->
            <div class="flex flex-col gap-2">
              <h2 class="font-mono text-lg font-bold text-foreground mb-4">Verification Timeline</h2>
              <div class="flex flex-col">
                <div v-for="step in steps" :key="step.title" class="border-l-2 border-border pl-5 pb-6 last:pb-0 relative">
                  <!-- Dot Indicator -->
                  <div
                    class="absolute -left-[7px] top-0.5 w-3 h-3 border-2 flex-shrink-0"
                    :class="circleClass(step.status)"
                  >
                    <span v-if="step.status === 'complete'" class="material-symbols-rounded text-white text-[8px] absolute inset-0 flex items-center justify-center">check</span>
                  </div>
                  <!-- Content -->
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-3">
                      <span
                        class="font-mono text-sm font-semibold"
                        :class="{
                          'text-foreground': step.status === 'complete',
                          'text-[#FF8400]': step.status === 'in_progress',
                          'text-muted-foreground': step.status === 'pending',
                        }"
                      >{{ step.title }}</span>
                      <span
                        class="px-2 py-0.5 text-[11px] font-semibold font-mono flex-shrink-0"
                        :class="statusBadgeClass(step.status)"
                      >{{ statusLabel(step.status) }}</span>
                    </div>
                    <p class="font-sans text-sm text-muted-foreground leading-relaxed">{{ step.detail }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
            <!-- Need Help Card -->
            <div class="bg-card border border-border p-6 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[28px] text-[#FF8400]">support_agent</span>
              <h3 class="font-mono text-sm font-semibold text-foreground">Need Help?</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">
                If you have questions about your verification, contact the requesting agent or reach out to our support team.
              </p>
              <NuxtLink
                to="/contact"
                class="w-full py-3 border border-border font-sans text-sm font-semibold text-foreground text-center hover:bg-card transition-colors"
              >
                Contact Support
              </NuxtLink>
            </div>

            <!-- Notifications Card -->
            <div class="bg-card border border-border p-6 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[28px] text-[#FF8400]">notifications_active</span>
              <h3 class="font-mono text-sm font-semibold text-foreground">Notifications</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">
                Email updates are sent automatically at each verification milestone. Check your inbox for real-time progress notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
