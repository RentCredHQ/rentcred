<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Report Detail — RentCred' })

const route = useRoute()
const caseId = computed(() => route.params.id as string)

const { getReport } = useReports()

const loading = ref(true)

function getReportStatusLabel(status: string) {
  const map: Record<string, string> = { approved: 'Ready', pending_approval: 'Pending Review', draft: 'Draft', rejected: 'Rejected' }
  return map[status] || status
}

function getRatingInfo(rating: string) {
  const map: Record<string, { label: string; sub: string }> = {
    excellent: { label: 'Verified — Low Concern', sub: 'All verification checks passed' },
    good: { label: 'Verified — Low Concern', sub: 'All verification checks passed' },
    fair: { label: 'Verified — Medium Concern', sub: 'Some checks require attention' },
    poor: { label: 'Verified — High Concern', sub: 'Several checks flagged' },
    fail: { label: 'Failed Verification', sub: 'Critical checks did not pass' },
  }
  return map[rating] || { label: rating, sub: '' }
}

const report = ref({
  tenantName: '',
  caseId: '',
  generatedDate: '',
  status: '',
  recommendation: '',
  recommendationSub: '',
  tenant: {
    phone: '',
    email: '',
    address: '',
    submitted: '',
    package: '',
  },
  property: {
    type: '',
    bedrooms: 0,
    annualRent: 0,
    state: '',
    lga: '',
    neighborhood: '',
    landlordName: '',
    landlordPhone: '',
    condition: '',
    images: [] as string[],
  },
})

const verificationCards = ref<any[]>([])

function buildVerificationCards(content: any) {
  if (!content?.verificationResults) return []
  const vr = content.verificationResults
  const cards = []

  cards.push({
    title: 'Identity Verification',
    status: vr.identityVerified ? 'Passed' : 'Failed',
    rows: [
      { label: 'Identity Verified', value: vr.identityVerified ? 'Confirmed' : 'Not Confirmed', positive: vr.identityVerified },
    ],
  })

  cards.push({
    title: 'Employment & Income',
    status: vr.employmentVerified ? 'Passed' : 'Failed',
    rows: [
      { label: 'Employment Verified', value: vr.employmentVerified ? 'Confirmed' : 'Not Confirmed', positive: vr.employmentVerified },
    ],
  })

  cards.push({
    title: 'Reference Checks',
    status: vr.referencesVerified ? 'Passed' : 'Failed',
    rows: [
      { label: 'References Verified', value: vr.referencesVerified ? 'Positive' : 'Pending', positive: vr.referencesVerified },
    ],
  })

  cards.push({
    title: 'Address Verification',
    status: vr.addressVerified ? 'Passed' : 'Failed',
    rows: [
      { label: 'Address Verified', value: vr.addressVerified ? 'Confirmed' : 'Not Confirmed', positive: vr.addressVerified },
    ],
  })

  cards.push({
    title: 'Criminal Record',
    status: vr.criminalCheckClear ? 'Passed' : 'Failed',
    rows: [
      { label: 'Criminal Check', value: vr.criminalCheckClear ? 'No records found' : 'Records found', positive: vr.criminalCheckClear },
    ],
  })

  return cards
}

onMounted(async () => {
  try {
    const res = await getReport(caseId.value)
    const r = res.data ?? res
    const content = r.content || {}
    const ratingInfo = getRatingInfo(content.overallRating)

    report.value = {
      tenantName: content.tenantInfo?.name || '',
      caseId: r.submissionId || r.id || '',
      generatedDate: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: getReportStatusLabel(r.status),
      recommendation: ratingInfo.label,
      recommendationSub: ratingInfo.sub,
      tenant: {
        phone: content.tenantInfo?.phone || '',
        email: content.tenantInfo?.email || '',
        address: content.propertyInfo?.address || '',
        submitted: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        package: 'Standard Check',
      },
      property: {
        type: content.propertyInfo?.propertyType || '',
        bedrooms: content.propertyInfo?.bedrooms || 0,
        annualRent: content.propertyInfo?.annualRent || 0,
        state: content.propertyInfo?.state || '',
        lga: content.propertyInfo?.lga || '',
        neighborhood: content.propertyInfo?.neighborhood || '',
        landlordName: content.propertyInfo?.landlordName || '',
        landlordPhone: content.propertyInfo?.landlordPhone || '',
        condition: content.propertyInfo?.propertyCondition || '',
        images: content.propertyInfo?.propertyImages || [],
      },
    }

    verificationCards.value = buildVerificationCards(content)
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
    <!-- Mobile Back Nav -->
    <div class="lg:hidden flex items-center gap-3 -mt-2">
      <NuxtLink to="/dashboard/reports">
        <span class="material-symbols-rounded text-[22px] text-foreground">arrow_back</span>
      </NuxtLink>
      <span class="font-mono text-base font-bold text-foreground">Report Detail</span>
    </div>

    <!-- Breadcrumb (Desktop) -->
    <div class="hidden lg:flex items-center gap-2 text-[13px]">
      <NuxtLink to="/dashboard/reports" class="font-sans text-muted-foreground hover:text-foreground transition-colors">Reports</NuxtLink>
      <span class="text-muted-foreground">/</span>
      <span class="font-mono font-medium text-foreground">{{ report.caseId }}</span>
    </div>

    <!-- Header Row -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <h1 class="font-mono text-xl lg:text-2xl font-bold text-foreground">{{ report.tenantName }}</h1>
        <div class="flex flex-wrap items-center gap-3 lg:gap-4">
          <span class="font-mono text-[13px] text-muted-foreground">{{ report.caseId }}</span>
          <span class="font-sans text-[13px] text-muted-foreground">Generated: {{ report.generatedDate }}</span>
          <span class="inline-flex px-3 py-1 rounded-full bg-[#DFE6E1] text-[#004D1A] text-[12px] font-semibold">{{ report.status }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
          <span class="material-symbols-rounded text-[16px]">share</span>
          Share Report
        </button>
        <button class="flex items-center gap-2 px-5 py-2.5 bg-[#E7E8E5] border border-border text-foreground font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
          <span class="material-symbols-rounded text-[16px]">download</span>
          Download
        </button>
      </div>
    </div>

    <!-- Recommendation Band -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#DFE6E1] px-5 lg:px-6 py-4 rounded-none lg:rounded-none">
      <div class="flex items-center gap-3">
        <span class="material-symbols-rounded text-[24px] text-[#004D1A]">verified</span>
        <span class="font-mono text-sm lg:text-base font-bold text-[#004D1A]">{{ report.recommendation }}</span>
      </div>
      <span class="font-sans text-sm text-[#004D1A]">{{ report.recommendationSub }}</span>
    </div>

    <!-- Report Body: Two Columns on Desktop, Stack on Mobile -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Column: Verification Cards -->
      <div class="flex-1 flex flex-col gap-5">
        <div
          v-for="card in verificationCards"
          :key="card.title"
          class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-4"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-[14px] lg:text-[15px] font-semibold text-foreground">{{ card.title }}</span>
            <span class="inline-flex px-2.5 py-1 rounded-full bg-[#DFE6E1] text-[#004D1A] text-[11px] font-semibold">{{ card.status }}</span>
          </div>
          <!-- Rows -->
          <div class="flex flex-col gap-3">
            <div v-for="row in card.rows" :key="row.label" class="flex items-center justify-between">
              <span class="font-sans text-[13px] text-muted-foreground">{{ row.label }}</span>
              <span
                class="text-[13px] font-medium"
                :class="[
                  row.positive ? 'text-[#004D1A]' : 'text-foreground',
                  row.mono ? 'font-mono' : 'font-sans'
                ]"
              >{{ row.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Tenant Info -->
      <div class="w-full lg:w-[340px] flex flex-col gap-5">
        <!-- Tenant Info Card -->
        <div class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-3.5">
          <span class="font-mono text-[14px] font-semibold text-foreground">Tenant Information</span>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Phone</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.tenant.phone }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Email</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.tenant.email }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Property Address</span>
            <span class="font-sans text-[13px] font-medium text-foreground leading-[1.4]">{{ report.tenant.address }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Submitted</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.tenant.submitted }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Package</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.tenant.package }}</span>
          </div>
        </div>

        <!-- Property Details Card -->
        <div class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-3.5">
          <span class="font-mono text-[14px] font-semibold text-foreground">Property Details</span>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Type</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.property.type }} · {{ report.property.bedrooms }} bed{{ report.property.bedrooms !== 1 ? 's' : '' }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Annual Rent</span>
            <span class="font-mono text-[13px] font-medium text-foreground">₦{{ report.property.annualRent.toLocaleString('en-NG') }}/yr</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Location</span>
            <span class="font-sans text-[13px] font-medium text-foreground leading-[1.4]">{{ report.property.neighborhood }}, {{ report.property.lga }}, {{ report.property.state }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Landlord</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.property.landlordName }}</span>
            <span class="font-sans text-[12px] text-muted-foreground">{{ report.property.landlordPhone }}</span>
          </div>
          <div v-if="report.property.condition" class="flex flex-col gap-0.5">
            <span class="font-sans text-[12px] text-muted-foreground">Condition</span>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ report.property.condition }}</span>
          </div>
          <div v-if="report.property.images.length > 0" class="flex flex-col gap-1.5">
            <span class="font-sans text-[12px] text-muted-foreground">Photos</span>
            <div class="grid grid-cols-3 gap-1.5">
              <div v-for="(img, i) in report.property.images" :key="i" class="aspect-square rounded-lg overflow-hidden border border-border">
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
