<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const token = computed(() => route.params.token as string)

useSeoMeta({ title: 'Shared Verification Report — RentCred' })

const { getSharedReport } = useReports()
const report = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const result = await getSharedReport(token.value)
    report.value = result
  } catch (e: any) {
    error.value = e.data?.message || 'This report is not available or the link has expired.'
  } finally {
    loading.value = false
  }
})

function formatNaira(amount: number) {
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Verdict band — one segment per check, green when verified, amber when not.
const VERDICT_KEYS = [
  'identityVerified', 'employmentVerified', 'referencesVerified',
  'addressVerified', 'criminalCheckDone', 'fieldVisitCompleted',
]
const verdictBand = computed<string[]>(() => {
  const v = report.value?.content?.verification
  if (!v) return []
  return VERDICT_KEYS.filter(k => k in v).map(k => (v[k] ? 'green' : 'amber'))
})
const verifiedCount = computed(() => verdictBand.value.filter((h: string) => h === 'green').length)
</script>

<template>
  <div>
    <!-- Hero Banner -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-4">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">VERIFICATION REPORT</span>
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-semibold text-white text-center">
          {{ loading ? 'Loading...' : error ? 'Report Unavailable' : report?.submission?.tenantName }}
        </h1>
        <p v-if="!loading && !error && report" class="font-sans text-[15px] text-[#7A7A7A]">
          Approved {{ formatDate(report.approvedAt) }}
        </p>
      </div>
    </section>

    <!-- Loading — skeleton mirroring the report shape -->
    <section v-if="loading" class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="max-w-[900px] mx-auto flex flex-col gap-6">
          <UiSkeleton h="60px" rounded="8px" />
          <UiSkeleton h="8px" rounded="999px" />
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <UiSkeleton v-for="i in 4" :key="i" h="44px" rounded="8px" />
          </div>
          <div class="border border-border rounded-lg p-5 flex flex-col gap-4">
            <UiSkeleton w="40%" h="16px" />
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <UiSkeleton v-for="i in 6" :key="i" h="20px" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex justify-center">
        <div class="border border-border p-8 max-w-[480px] flex flex-col items-center gap-4 text-center">
          <span class="material-symbols-rounded text-[48px] text-muted-foreground">link_off</span>
          <h2 class="font-mono text-lg font-semibold text-foreground">Report Not Found</h2>
          <p class="font-sans text-sm text-muted-foreground">{{ error }}</p>
          <NuxtLink to="/" class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity">
            Go to RentCred
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Report Content -->
    <section v-else-if="report" class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="max-w-[900px] mx-auto flex flex-col gap-6">

          <!-- Verified Badge -->
          <div class="flex items-center gap-3 bg-[#DFE6E1] border border-[#B8D4C0] px-5 py-4">
            <span class="material-symbols-rounded text-[28px] text-[#004D1A]">verified</span>
            <div>
              <p class="font-mono text-sm font-bold text-[#004D1A]">Verification Complete</p>
              <p class="font-sans text-[13px] text-[#004D1A]">This report was reviewed and approved by RentCred Operations</p>
            </div>
          </div>

          <!-- Verdict band — at-a-glance check outcomes -->
          <div v-if="verdictBand.length" class="flex flex-col gap-2">
            <div class="flex h-2 overflow-hidden rounded-full">
              <span
                v-for="(hue, i) in verdictBand"
                :key="i"
                class="flex-1"
                :style="{ background: `var(--color-st-${hue}-vivid)` }"
              />
            </div>
            <span class="font-mono text-[11px] text-muted-foreground tracking-wider uppercase">
              {{ verifiedCount }} of {{ verdictBand.length }} checks fully verified
            </span>
          </div>

          <!-- Property Details -->
          <div class="flex flex-col gap-4">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">PROPERTY INFORMATION</span>
          </div>
          <div class="border border-border overflow-hidden">
            <div class="px-5 py-4 border-b border-border">
              <h2 class="font-mono text-sm font-semibold text-foreground">Property Details</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div class="flex flex-col gap-4 p-5">
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Address</span>
                  <span class="font-sans text-[13px] font-medium text-foreground text-right max-w-[200px]">{{ report.submission?.propertyAddress }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Type</span>
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ report.submission?.propertyType }}</span>
                </div>
                <div v-if="report.submission?.bedrooms" class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Bedrooms</span>
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ report.submission.bedrooms }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-4 p-5">
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Location</span>
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ report.submission?.neighborhood }}, {{ report.submission?.state }}</span>
                </div>
                <div v-if="report.submission?.annualRent" class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Annual Rent</span>
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ formatNaira(report.submission.annualRent) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Tenant</span>
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ report.submission?.tenantName }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Report Summary -->
          <div v-if="report.content" class="flex flex-col gap-4">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">VERIFICATION SUMMARY</span>
          </div>
          <div v-if="report.content" class="border border-border overflow-hidden">
            <div class="px-5 py-4 border-b border-border">
              <h2 class="font-mono text-sm font-semibold text-foreground">Verification Summary</h2>
            </div>
            <div class="p-5">
              <div v-if="typeof report.content === 'object'" class="flex flex-col gap-4">
                <!-- Backend content shape: { tenant, property, employment, verification, fieldVisit, generatedAt } -->
                <div v-if="report.content.summary" class="font-sans text-[14px] text-foreground leading-relaxed">
                  {{ report.content.summary }}
                </div>

                <!-- Verification checklist from content.verification -->
                <div v-if="report.content.verification" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div v-for="(checked, label) in {
                    'Identity': report.content.verification.identityVerified,
                    'Employment': report.content.verification.employmentVerified,
                    'References': report.content.verification.referencesVerified,
                    'Address': report.content.verification.addressVerified,
                    'Criminal Check': report.content.verification.criminalCheckDone,
                    'Field Visit': report.content.verification.fieldVisitCompleted,
                  }" :key="label" class="flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-[16px]" :class="checked ? 'text-st-green-text' : 'text-muted-foreground'">
                      {{ checked ? 'check_circle' : 'radio_button_unchecked' }}
                    </span>
                    <span class="font-sans text-[13px]" :class="checked ? 'text-foreground' : 'text-muted-foreground'">{{ label }}</span>
                  </div>
                </div>

                <!-- Employment info from content.employment -->
                <div v-if="report.content.employment" class="flex flex-col gap-2">
                  <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Employment</span>
                  <div class="flex justify-between" v-if="report.content.employment.employer">
                    <span class="font-sans text-[12px] text-muted-foreground">Employer</span>
                    <span class="font-sans text-[13px] font-medium text-foreground">{{ report.content.employment.employer }}</span>
                  </div>
                </div>

                <div v-if="report.content.recommendations" class="flex flex-col gap-1.5">
                  <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</span>
                  <p class="font-sans text-[14px] text-foreground">{{ report.content.recommendations }}</p>
                </div>
                <div v-if="report.content.riskLevel" class="flex items-center gap-2">
                  <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Risk Level</span>
                  <UiStatusPill
                    :hue="report.content.riskLevel === 'low' ? 'green' : report.content.riskLevel === 'high' ? 'red' : 'amber'"
                    :label="`${report.content.riskLevel?.toUpperCase()} RISK`"
                  />
                </div>
              </div>
              <p v-else class="font-sans text-[14px] text-foreground leading-relaxed">{{ report.content }}</p>
            </div>
          </div>

          <!-- Property Images -->
          <div v-if="report.submission?.propertyImages?.length" class="border border-border overflow-hidden">
            <div class="px-5 py-4 border-b border-border">
              <h2 class="font-mono text-sm font-semibold text-foreground">Property Photos</h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
              <img
                v-for="(url, i) in report.submission.propertyImages"
                :key="i"
                :src="url"
                class="w-full aspect-video object-cover border border-border"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <section v-if="!loading && !error && report" class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-3 text-center">
        <p class="font-sans text-sm text-[#7A7A7A]">
          This report was generated by RentCred and is valid as of {{ formatDate(report.approvedAt) }}.
        </p>
        <p class="font-sans text-[13px] text-[#555]">
          Report data reflects information available at the time of verification and should be considered a point-in-time assessment.
        </p>
        <NuxtLink to="/" class="font-sans text-[13px] font-medium text-[#FF8400] hover:underline mt-2">
          Powered by RentCred — Nigeria's Tenant Verification Platform
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
