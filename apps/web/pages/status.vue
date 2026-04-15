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
    <!-- HERO (dark) -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-6 max-w-[680px] mx-auto">
          <span class="font-mono text-xs font-semibold text-[#FF8400] uppercase tracking-wider">TRACK YOUR CASE</span>
          <h1 class="font-mono text-3xl sm:text-4xl lg:text-[44px] font-bold text-white text-center leading-tight">
            Check your verification status
          </h1>
          <p class="font-sans text-base lg:text-lg text-[#7A7A7A] text-center leading-relaxed">
            Enter your case ID or the email address used during submission.
          </p>
          <form class="flex flex-col sm:flex-row items-stretch gap-3 mt-2 w-full max-w-[560px]" @submit.prevent="handleSearch">
            <input
              v-model="caseInput"
              type="text"
              placeholder="Enter Case ID (e.g. RC-2026-00412)"
              class="flex-1 w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-[#FF8400]"
            />
            <button
              type="submit"
              :disabled="loading"
              class="bg-[#FF8400] text-[#0D0D0D] font-semibold px-8 py-3 hover:bg-[#E67700] transition-colors disabled:opacity-60 font-sans text-sm whitespace-nowrap"
            >
              {{ loading ? 'Searching...' : 'Track Status' }}
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- RESULTS (light) -->
    <section v-if="searched" class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="max-w-[800px] mx-auto flex flex-col items-center gap-10">
          <!-- Not Found State -->
          <div v-if="!result" class="flex flex-col items-center gap-4 text-center">
            <span class="material-symbols-rounded text-[48px] text-muted-foreground">search_off</span>
            <h2 class="font-mono text-xl lg:text-2xl font-bold text-foreground">No case found</h2>
            <p class="font-sans text-sm text-muted-foreground max-w-[480px]">
              We couldn't find a case matching "{{ caseInput }}". Please check the ID and try again, or use the email address associated with your submission.
            </p>
            <button
              class="mt-2 font-sans text-sm font-semibold text-[#FF8400] hover:underline"
              @click="searched = false; caseInput = ''"
            >
              Try another search
            </button>
          </div>

          <!-- Found Case Card -->
          <div v-if="result" class="w-full border border-border p-6 flex flex-col gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex flex-col gap-1">
                <span class="font-mono text-base font-bold text-foreground">{{ result.caseId }}</span>
                <span class="font-sans text-sm text-muted-foreground">Tenant: {{ result.tenantName }}</span>
              </div>
              <span class="inline-flex self-start px-3 py-1 bg-[#FF8400]/10 text-[#FF8400] text-xs font-semibold font-mono">
                {{ result.status }}
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full">
              <div class="flex items-center justify-between mb-2">
                <span class="font-sans text-xs text-muted-foreground">Progress</span>
                <span class="font-mono text-xs font-semibold text-foreground">
                  {{ result.steps.filter(s => s.status === 'complete').length }} / {{ result.steps.length }} steps
                </span>
              </div>
              <div class="w-full h-1.5 bg-border">
                <div
                  class="h-1.5 bg-[#FF8400] transition-all"
                  :style="{ width: `${(result.steps.filter(s => s.status === 'complete').length / result.steps.length) * 100}%` }"
                />
              </div>
            </div>

            <!-- Timeline -->
            <div class="flex flex-col gap-0">
              <div v-for="(step, i) in result.steps" :key="i" class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="w-5 h-5 border-2 flex items-center justify-center flex-shrink-0"
                    :class="{
                      'bg-[#004D1A] border-[#004D1A]': step.status === 'complete',
                      'bg-[#FF8400] border-[#FF8400]': step.status === 'in_progress',
                      'bg-transparent border-border': step.status === 'pending',
                    }"
                  >
                    <span v-if="step.status === 'complete'" class="material-symbols-rounded text-white text-[14px]">check</span>
                  </div>
                  <div v-if="i < result.steps.length - 1" class="w-px h-10 bg-border" />
                </div>
                <div class="pb-6 -mt-0.5">
                  <span
                    class="font-mono text-sm font-semibold"
                    :class="{
                      'text-[#004D1A]': step.status === 'complete',
                      'text-[#FF8400]': step.status === 'in_progress',
                      'text-muted-foreground': step.status === 'pending',
                    }"
                  >{{ step.label }}</span>
                  <p class="font-sans text-xs text-muted-foreground mt-0.5">{{ step.detail }}</p>
                </div>
              </div>
            </div>

            <NuxtLink
              :to="`/status/${result.caseId}`"
              class="inline-flex self-start font-sans text-sm font-semibold text-[#FF8400] hover:underline"
            >
              View Full Details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ (dark) -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-4 mb-12">
          <span class="font-mono text-xs font-semibold text-[#FF8400] uppercase tracking-wider">COMMON QUESTIONS</span>
          <h2 class="font-mono text-2xl lg:text-3xl font-bold text-white text-center">
            Verification status FAQ
          </h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[960px] mx-auto">
          <div v-for="(faq, i) in faqs" :key="i" class="bg-[#161616] border border-[#2A2A2A] p-6 flex flex-col gap-3">
            <span class="font-mono text-sm font-semibold text-white">{{ faq.q }}</span>
            <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
