<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Track Your Verification — RentCred',
  description: 'Enter your case ID to check the real-time progress of your tenant verification.',
})

const caseInput = ref('')
const searched = ref(false)
const loading = ref(false)

// Sample data for demo
const sampleCase = {
  caseId: 'RC-2026-00412',
  tenantName: 'Adebayo Okonkwo',
  status: 'In Progress',
  steps: [
    { label: 'Case Submitted', detail: 'Mar 5, 2026', status: 'complete' },
    { label: 'Identity Verification', detail: 'NIN & BVN confirmed', status: 'complete' },
    { label: 'Employment Verification', detail: 'Currently verifying with employer', status: 'in_progress' },
    { label: 'Reference Checks', detail: 'Pending', status: 'pending' },
    { label: 'Report Generation', detail: 'Pending', status: 'pending' },
  ],
}

const result = ref<typeof sampleCase | null>(null)

function handleSearch() {
  if (!caseInput.value.trim()) return
  loading.value = true
  searched.value = false
  setTimeout(() => {
    loading.value = false
    if (caseInput.value.toUpperCase().includes('RC-')) {
      navigateTo(`/status/${caseInput.value.trim()}`)
    } else {
      searched.value = true
      result.value = null
    }
  }, 800)
}

const faqs = [
  { q: 'What is the case ID?', a: 'Your case ID is a unique reference number assigned when a verification request is submitted. It starts with "RC-" followed by the year and a sequential number.' },
  { q: 'How long does a typical verification take?', a: 'Standard verifications are completed within 48 hours. Premium verifications with additional checks may take up to 72 hours.' },
  { q: 'Can I track a case on behalf of my client?', a: 'Yes. Agents, landlords, and tenants can all track verification progress using the case ID provided at submission.' },
  { q: 'What happens after all checks are complete?', a: 'Once all verification steps pass, a comprehensive report is generated and sent to the requesting agent. The tenant is also notified of completion.' },
]

const openFaq = ref<number | null>(null)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-[#0D0D0D] px-5 lg:px-20 py-16 lg:py-24">
      <div class="max-w-[1440px] mx-auto flex flex-col items-center gap-6">
        <h1 class="font-mono text-3xl lg:text-[40px] font-bold text-white text-center leading-tight max-w-[800px]">
          Track Your Verification Status
        </h1>
        <p class="font-sans text-base lg:text-lg text-[#7A7A7A] text-center max-w-[600px]">
          Enter your case ID to check real-time progress of your tenant verification.
        </p>
        <form class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 w-full max-w-[560px]" @submit.prevent="handleSearch">
          <input
            v-model="caseInput"
            type="text"
            placeholder="Enter Case ID (e.g. RC-2026-00412)"
            class="flex-1 px-5 py-3.5 bg-[#1A1A1A] border border-[#2E2E2E] text-white font-mono text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FF8400] transition-colors"
          />
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-3.5 bg-[#FF8400] text-[#0D0D0D] font-mono text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
          >
            {{ loading ? 'Searching...' : 'Track Status' }}
          </button>
        </form>
      </div>
    </section>

    <!-- Result Section -->
    <section v-if="searched" class="bg-background px-5 lg:px-20 py-12 lg:py-16">
      <div class="max-w-[800px] mx-auto flex flex-col items-center gap-10">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Search Result</span>
          <h2 class="font-mono text-xl lg:text-2xl font-bold text-foreground">
            {{ result ? 'Sample Case Lookup' : 'No Case Found' }}
          </h2>
          <p v-if="!result" class="font-sans text-sm text-muted-foreground text-center">
            We couldn't find a case matching "{{ caseInput }}". Please check the ID and try again.
          </p>
        </div>

        <!-- Case Card -->
        <div v-if="result" class="w-full bg-white border border-border rounded-xl p-5 lg:p-8 flex flex-col gap-6">
          <!-- Card Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-base font-bold text-foreground">{{ result.caseId }}</span>
              <span class="font-sans text-sm text-muted-foreground">Tenant: {{ result.tenantName }}</span>
            </div>
            <span class="inline-flex self-start px-3 py-1 rounded-full bg-[#DFDFE6] text-[#000066] text-[12px] font-semibold">
              {{ result.status }}
            </span>
          </div>

          <!-- Timeline -->
          <div class="flex flex-col gap-0">
            <div v-for="(step, i) in result.steps" :key="i" class="flex gap-4">
              <!-- Timeline Indicator -->
              <div class="flex flex-col items-center">
                <!-- Dot -->
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  :class="{
                    'bg-[#004D1A] border-[#004D1A]': step.status === 'complete',
                    'bg-[#FF8400] border-[#FF8400]': step.status === 'in_progress',
                    'bg-transparent border-border': step.status === 'pending',
                  }"
                >
                  <span v-if="step.status === 'complete'" class="material-symbols-rounded text-white text-[14px]">check</span>
                </div>
                <!-- Line -->
                <div v-if="i < result.steps.length - 1" class="w-px h-10 bg-border" />
              </div>
              <!-- Content -->
              <div class="pb-6 -mt-0.5">
                <span
                  class="font-mono text-[14px] font-semibold"
                  :class="{
                    'text-[#004D1A]': step.status === 'complete',
                    'text-[#FF8400]': step.status === 'in_progress',
                    'text-muted-foreground': step.status === 'pending',
                  }"
                >{{ step.label }}</span>
                <p class="font-sans text-[13px] text-muted-foreground mt-0.5">{{ step.detail }}</p>
                <span
                  v-if="step.status !== 'pending'"
                  class="inline-flex mt-1.5 px-2 py-0.5 rounded text-[11px] font-semibold"
                  :class="{
                    'bg-[#DFE6E1] text-[#004D1A]': step.status === 'complete',
                    'bg-[#DFDFE6] text-[#000066]': step.status === 'in_progress',
                  }"
                >
                  {{ step.status === 'complete' ? 'Complete' : 'In Progress' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="bg-white px-5 lg:px-20 py-16 lg:py-20">
      <div class="max-w-[800px] mx-auto flex flex-col items-center gap-12">
        <div class="flex flex-col items-center gap-3">
          <h2 class="font-mono text-xl lg:text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div class="w-full flex flex-col">
          <div v-for="(faq, i) in faqs" :key="i" class="border-b border-border">
            <button
              class="w-full flex items-center justify-between py-5 text-left"
              @click="toggleFaq(i)"
            >
              <span class="font-sans text-[15px] font-medium text-foreground pr-4">{{ faq.q }}</span>
              <span class="material-symbols-rounded text-[20px] text-muted-foreground transition-transform" :class="openFaq === i ? 'rotate-180' : ''">keyboard_arrow_down</span>
            </button>
            <div v-if="openFaq === i" class="pb-5 -mt-1">
              <p class="font-sans text-[14px] text-muted-foreground leading-relaxed">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
