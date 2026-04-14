<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
const route = useRoute()
const visitId = route.params.id as string
const { api } = useApi()
const { getSubmission } = useSubmissions()

const items = ref<string[]>([])
const checked = ref<boolean[]>([])
const notes = ref('')
const result = ref<'verified' | 'flagged' | null>('verified')
const loading = ref(true)
const submitting = ref(false)

onMounted(async () => {
  try {
    const res = await getSubmission(visitId)
    items.value = res?.checklist ?? []
    checked.value = items.value.map(() => false)
  } catch { /* empty */ }
  finally { loading.value = false }
})

function toggle(i: number) { checked.value[i] = !checked.value[i] }

async function submit() {
  submitting.value = true
  try {
    await api('/field-agents/visit', {
      method: 'POST',
      body: {
        visitId,
        checklist: items.value.map((item, i) => ({ item, checked: checked.value[i] })),
        notes: notes.value,
        result: result.value,
      },
    })
    navigateTo('/field-agent')
  } catch { /* empty */ }
  finally { submitting.value = false }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <button @click="navigateTo(`/field-agent/visits/${visitId}`)" class="flex items-center gap-2 text-foreground">
        <span class="material-symbols-rounded text-[20px]">arrow_back</span>
        <span class="font-mono text-base font-semibold">Submit Report</span>
      </button>
      <span class="font-mono text-[11px] text-muted-foreground">{{ visitId }}</span>
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-mono text-[13px] font-semibold text-foreground">Verification Checklist</span>
      <div class="bg-card border border-border rounded-xl overflow-hidden">
        <div v-for="(item, i) in items" :key="item" @click="toggle(i)"
          class="flex items-center gap-3 px-4 py-3.5 cursor-pointer" :class="i < items.length - 1 ? 'border-b border-border' : ''">
          <span class="material-symbols-rounded text-[20px]" :class="checked[i] ? 'text-[#004D1A]' : 'text-muted-foreground'">
            {{ checked[i] ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <span class="font-sans text-[13px]" :class="checked[i] ? 'text-foreground' : 'text-muted-foreground'">{{ item }}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-mono text-[13px] font-semibold text-foreground">Photo Evidence</span>
      <div class="flex gap-2.5">
        <div class="w-20 h-20 rounded-lg bg-secondary border border-border flex items-center justify-center">
          <span class="material-symbols-rounded text-[24px] text-muted-foreground">image</span>
        </div>
        <div class="w-20 h-20 rounded-lg bg-secondary border border-border flex items-center justify-center">
          <span class="material-symbols-rounded text-[24px] text-muted-foreground">image</span>
        </div>
        <div class="w-20 h-20 rounded-lg bg-card border border-dashed border-primary flex flex-col items-center justify-center gap-1">
          <span class="material-symbols-rounded text-[22px] text-primary">add_a_photo</span>
          <span class="font-sans text-[10px] font-medium text-primary">Add</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-mono text-[13px] font-semibold text-foreground">Field Notes</span>
      <textarea v-model="notes" placeholder="Describe your findings..."
        class="w-full h-24 px-3.5 py-3 bg-card border border-border rounded-xl text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-mono text-[13px] font-semibold text-foreground">Verification Result</span>
      <div class="flex gap-2.5">
        <button @click="result = 'verified'"
          class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-mono font-semibold transition-colors"
          :class="result === 'verified' ? 'bg-[#DFE6E1] border-[1.5px] border-[#004D1A] text-[#004D1A]' : 'bg-card border border-border text-muted-foreground'">
          <span class="material-symbols-rounded text-[18px]">check_circle</span> Verified
        </button>
        <button @click="result = 'flagged'"
          class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-mono font-semibold transition-colors"
          :class="result === 'flagged' ? 'bg-[#E5DCDA] border-[1.5px] border-[#8C1C00] text-[#8C1C00]' : 'bg-card border border-border text-muted-foreground'">
          <span class="material-symbols-rounded text-[18px]">cancel</span> Flagged
        </button>
      </div>
    </div>
    <button @click="submit" :disabled="submitting"
      class="flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-mono text-sm font-semibold disabled:opacity-60">
      <span v-if="submitting" class="material-symbols-rounded text-[18px] animate-spin">progress_activity</span>
      <span v-else class="material-symbols-rounded text-[18px]">send</span>
      {{ submitting ? 'Submitting...' : 'Submit Report' }}
    </button>
  </div>
</template>
