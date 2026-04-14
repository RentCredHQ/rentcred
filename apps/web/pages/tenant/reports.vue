<script setup lang="ts">
definePageMeta({ layout: 'tenant' })
useSeoMeta({ title: 'My Reports — RentCred' })

const { getMyReports } = useTenantProfile()
const reports = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await getMyReports()
    reports.value = result.data || []
  } catch {
    // No reports
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="font-mono text-xl lg:text-2xl font-bold text-foreground">My Reports</h1>
      <p class="font-sans text-sm text-muted-foreground">View your completed verification reports</p>
    </div>

    <div v-for="report in reports" :key="report.id" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-4 shadow-sm">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-0.5">
          <span class="font-sans text-[15px] font-medium text-foreground">{{ report.submission?.propertyAddress }}</span>
          <span class="font-sans text-[13px] text-muted-foreground">
            {{ report.submission?.propertyType }} &bull; {{ report.submission?.neighborhood }}, {{ report.submission?.state }}
          </span>
        </div>
        <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DFE6E1] text-[#004D1A]">Approved</span>
      </div>

      <div class="flex items-center gap-4 text-[13px] font-sans text-muted-foreground">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-rounded text-[16px]">person</span>
          {{ report.submission?.agent?.name }}
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-rounded text-[16px]">calendar_today</span>
          {{ new Date(report.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}
        </div>
      </div>

      <NuxtLink
        v-if="report.shareToken"
        :to="`/report/${report.shareToken}`"
        class="flex items-center justify-center gap-2 w-full py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors rounded-lg"
      >
        <span class="material-symbols-rounded text-[18px]">visibility</span>
        View Report
      </NuxtLink>
    </div>

    <div v-if="!loading && reports.length === 0" class="bg-white border border-border rounded-xl p-8 flex flex-col items-center gap-4 text-center">
      <span class="material-symbols-rounded text-[48px] text-muted-foreground">description</span>
      <h3 class="font-mono text-lg font-semibold text-foreground">No Reports Yet</h3>
      <p class="font-sans text-sm text-muted-foreground max-w-[400px]">Completed verification reports will appear here once approved.</p>
    </div>
  </div>
</template>
