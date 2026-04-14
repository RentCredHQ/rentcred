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
</script>

<template>
  <div>
    <!-- Hero Banner -->
    <section class="bg-[#0D0D0D] px-5 lg:px-20 py-10 lg:py-12">
      <div class="max-w-[1440px] mx-auto flex flex-col items-center gap-3">
        <span class="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider">VERIFICATION REPORT</span>
        <h1 class="font-mono text-2xl lg:text-[32px] font-bold text-white">
          {{ loading ? 'Loading…' : error ? 'Report Unavailable' : report?.submission?.tenantName }}
        </h1>
        <p v-if="!loading && !error && report" class="font-sans text-[15px] text-[#7A7A7A]">
          Approved {{ formatDate(report.approvedAt) }}
        </p>
      </div>
    </section>

    <!-- Loading -->
    <section v-if="loading" class="bg-background px-5 lg:px-20 py-20 flex justify-center">
      <div class="flex flex-col items-center gap-3">
        <span class="material-symbols-rounded text-[40px] text-muted-foreground animate-spin">progress_activity</span>
        <p class="font-sans text-sm text-muted-foreground">Loading report…</p>
      </div>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="bg-background px-5 lg:px-20 py-20 flex justify-center">
      <div class="bg-white border border-border rounded-xl p-8 max-w-[480px] flex flex-col items-center gap-4 text-center">
        <span class="material-symbols-rounded text-[48px] text-muted-foreground">link_off</span>
        <h2 class="font-mono text-lg font-semibold text-foreground">Report Not Found</h2>
        <p class="font-sans text-sm text-muted-foreground">{{ error }}</p>
        <NuxtLink to="/" class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity">
          Go to RentCred
        </NuxtLink>
      </div>
    </section>

    <!-- Report Content -->
    <section v-else-if="report" class="bg-background px-5 lg:px-20 py-8 lg:py-12">
      <div class="max-w-[900px] mx-auto flex flex-col gap-6">

        <!-- Verified Badge -->
        <div class="flex items-center gap-3 bg-[#DFE6E1] border border-[#B8D4C0] rounded-xl px-5 py-4">
          <span class="material-symbols-rounded text-[28px] text-[#004D1A]">verified</span>
          <div>
            <p class="font-mono text-sm font-bold text-[#004D1A]">Verification Complete</p>
            <p class="font-sans text-[13px] text-[#004D1A]">This report was reviewed and approved by RentCred Operations</p>
          </div>
        </div>

        <!-- Property Details -->
        <div class="bg-white border border-border rounded-xl overflow-hidden">
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
        <div v-if="report.content" class="bg-white border border-border rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-border">
            <h2 class="font-mono text-sm font-semibold text-foreground">Verification Summary</h2>
          </div>
          <div class="p-5">
            <div v-if="typeof report.content === 'object'" class="flex flex-col gap-4">
              <div v-if="report.content.summary" class="font-sans text-[14px] text-foreground leading-relaxed">
                {{ report.content.summary }}
              </div>
              <div v-if="report.content.recommendations" class="flex flex-col gap-1.5">
                <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</span>
                <p class="font-sans text-[14px] text-foreground">{{ report.content.recommendations }}</p>
              </div>
              <div v-if="report.content.riskLevel" class="flex items-center gap-2">
                <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Risk Level</span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono"
                  :class="{
                    'bg-[#DFE6E1] text-[#004D1A]': report.content.riskLevel === 'low',
                    'bg-[#FFF3CD] text-[#856404]': report.content.riskLevel === 'medium',
                    'bg-[#F8D7DA] text-[#721C24]': report.content.riskLevel === 'high',
                  }"
                >
                  {{ report.content.riskLevel?.toUpperCase() }}
                </span>
              </div>
            </div>
            <p v-else class="font-sans text-[14px] text-foreground leading-relaxed">{{ report.content }}</p>
          </div>
        </div>

        <!-- Property Images -->
        <div v-if="report.submission?.propertyImages?.length" class="bg-white border border-border rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-border">
            <h2 class="font-mono text-sm font-semibold text-foreground">Property Photos</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
            <img
              v-for="(url, i) in report.submission.propertyImages"
              :key="i"
              :src="url"
              class="w-full aspect-video object-cover rounded-lg border border-border"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex flex-col items-center gap-2 pt-4 pb-8 text-center">
          <p class="font-sans text-[12px] text-muted-foreground">
            This report was generated by RentCred and is valid as of {{ formatDate(report.approvedAt) }}.
          </p>
          <NuxtLink to="/" class="font-sans text-[12px] font-medium text-primary hover:underline">
            Powered by RentCred — Nigeria's Tenant Verification Platform
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
