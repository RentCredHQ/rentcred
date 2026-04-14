<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Schedule — RentCred Field Agent' })

const { api } = useApi()

const activeDay = ref('Today')
const days = ['Today', 'Tomorrow', 'This Week']

const schedule = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api('/field-agents/assignments')
    schedule.value = res as any[]
  } catch { /* empty */ }
  finally { loading.value = false }
})

function statusClasses(status: string) {
  switch (status) {
    case 'Completed': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'In Progress': return 'bg-[#E9E3D8] text-[#804200]'
    default: return 'bg-background text-muted-foreground'
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <h1 class="font-mono text-lg font-semibold text-foreground">Schedule</h1>
    <div class="flex gap-2 overflow-x-auto">
      <button v-for="d in days" :key="d" @click="activeDay = d"
        class="px-4 py-2 rounded-full text-[12px] font-mono font-semibold whitespace-nowrap transition-colors"
        :class="activeDay === d ? 'bg-foreground text-white' : 'bg-card border border-border text-muted-foreground'">
        {{ d }}
      </button>
    </div>
    <div class="flex flex-col gap-3">
      <NuxtLink v-for="v in schedule" :key="v.id" :to="`/field-agent/visits/${v.id}`"
        class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="font-sans text-sm font-medium text-foreground">{{ v.tenant }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" :class="statusClasses(v.status)">{{ v.status }}</span>
        </div>
        <span class="font-sans text-[12px] text-muted-foreground">{{ v.type }}</span>
        <div class="flex items-center justify-between text-[12px] text-muted-foreground font-sans">
          <div class="flex items-center gap-1">
            <span class="material-symbols-rounded text-[14px]">location_on</span>
            {{ v.address }}
          </div>
          <span class="font-mono">{{ v.time }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
