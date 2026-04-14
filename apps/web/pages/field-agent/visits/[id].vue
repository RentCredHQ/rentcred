<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
const route = useRoute()
const visitId = route.params.id as string
const { getSubmission } = useSubmissions()

const visit = ref<any>(null)
const checklist = ref<string[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getSubmission(visitId)
    visit.value = res
    checklist.value = res?.checklist ?? []
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <button @click="navigateTo('/field-agent')" class="flex items-center gap-2 text-foreground">
        <span class="material-symbols-rounded text-[20px]">arrow_back</span>
        <span class="font-mono text-base font-semibold">Visit Details</span>
      </button>
      <span class="font-mono text-[11px] text-muted-foreground">{{ visit?.id }}</span>
    </div>
    <template v-if="loading">
      <div class="flex items-center justify-center py-12">
        <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
      </div>
    </template>
    <template v-else-if="visit">
    <span class="inline-flex self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E9E3D8] text-[#804200]">{{ visit.status }}</span>
    <div class="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <span class="font-sans text-base font-medium text-foreground">{{ visit.tenant }}</span>
      <span class="font-sans text-[13px] text-muted-foreground">{{ visit.type }}</span>
      <div class="flex items-center gap-2 text-[13px] text-muted-foreground font-sans">
        <span class="material-symbols-rounded text-[16px]">location_on</span>
        {{ visit.address }}
      </div>
      <div class="flex items-center gap-2 text-[13px] text-muted-foreground font-sans">
        <span class="material-symbols-rounded text-[16px]">calendar_today</span>
        {{ visit.time }}
      </div>
    </div>
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div v-for="(item, i) in [
        { label: 'Agent Company', value: visit.agent },
        { label: 'Submitted', value: visit.submitted },
        { label: 'Priority', value: visit.priority },
      ]" :key="item.label" class="flex items-center justify-between px-4 py-3" :class="i < 2 ? 'border-b border-border' : ''">
        <span class="font-sans text-[13px] text-muted-foreground">{{ item.label }}</span>
        <span class="font-sans text-[13px] text-foreground">{{ item.value }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-mono text-[13px] font-semibold text-foreground">Verification Checklist</span>
      <div class="bg-card border border-border rounded-xl overflow-hidden">
        <div v-for="(item, i) in checklist" :key="item" class="flex items-center gap-3 px-4 py-3.5" :class="i < checklist.length - 1 ? 'border-b border-border' : ''">
          <span class="material-symbols-rounded text-[20px] text-muted-foreground">radio_button_unchecked</span>
          <span class="font-sans text-[13px] text-foreground">{{ item }}</span>
        </div>
      </div>
    </div>
    <NuxtLink :to="`/field-agent/visits/${visitId}/submit`"
      class="flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-mono text-sm font-semibold">
      <span class="material-symbols-rounded text-[18px]">play_arrow</span>
      Start Verification
    </NuxtLink>
    </template>
  </div>
</template>
