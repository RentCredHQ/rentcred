<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
const route = useRoute()
const submissionId = route.params.id as string
const { api } = useApi()
const { getSubmission } = useSubmissions()
const { uploading, progress, error: uploadError, uploadFile, validateFile } = useUpload()

const submission = ref<any>(null)
const notes = ref('')
const summary = ref('')
const result = ref<'verified' | 'flagged'>('verified')
const photos = ref<{ key: string; publicUrl: string; preview: string }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(true)
const submitting = ref(false)
const submitError = ref('')

const FIELD_CHECKLIST = [
  { key: 'propertyExists', label: 'Property exists at stated address' },
  { key: 'tenantPresent', label: 'Tenant was present during visit' },
  { key: 'addressMatches', label: 'Address matches submission details' },
  { key: 'propertyConditionMatch', label: 'Property condition matches description' },
  { key: 'landlordConfirmed', label: 'Landlord/caretaker confirmed tenancy' },
  { key: 'neighborhoodVerified', label: 'Neighborhood assessment completed' },
]

const checklistState = ref<Record<string, boolean>>(
  Object.fromEntries(FIELD_CHECKLIST.map(c => [c.key, false]))
)

function toggleCheck(key: string) {
  checklistState.value[key] = !checklistState.value[key]
}

const checkedCount = computed(() => Object.values(checklistState.value).filter(Boolean).length)

onMounted(async () => {
  try {
    const res = await getSubmission(submissionId) as any
    submission.value = res?.data ?? res
  } catch { /* empty */ }
  finally { loading.value = false }
})

async function handlePhotoSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  const files = Array.from(input.files)
  const remaining = 10 - photos.value.length

  if (files.length > remaining) {
    uploadError.value = `You can only add ${remaining} more photo${remaining === 1 ? '' : 's'}`
    return
  }

  for (const file of files) {
    const validationError = validateFile(file)
    if (validationError) {
      uploadError.value = validationError
      continue
    }

    try {
      const preview = URL.createObjectURL(file)
      const r = await uploadFile(file, 'field-visit-photos')
      photos.value.push({ ...r, preview })
    } catch {
      // Error set by useUpload
    }
  }

  if (fileInput.value) fileInput.value.value = ''
}

function removePhoto(index: number) {
  const img = photos.value[index]
  if (img.preview) URL.revokeObjectURL(img.preview)
  photos.value.splice(index, 1)
}

async function handleSubmit() {
  submitError.value = ''

  if (!notes.value.trim()) {
    submitError.value = 'Please add field notes describing your findings'
    return
  }

  submitting.value = true
  try {
    await api('/field-agents/visit', {
      method: 'POST',
      body: {
        submissionId,
        visitDate: new Date().toISOString(),
        notes: notes.value,
        summary: summary.value || `Field visit ${result.value}. ${notes.value}`.trim(),
        checklistItems: checklistState.value,
        photos: photos.value.map(p => p.key),
        gpsLatitude: null,
        gpsLongitude: null,
      },
    })
    navigateTo('/field-agent')
  } catch (e: any) {
    submitError.value = e.data?.message || e.message || 'Failed to submit visit report'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-5 max-w-[640px]">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <button @click="navigateTo(`/field-agent/visits/${submissionId}`)" class="flex items-center gap-2 text-foreground">
        <span class="material-symbols-rounded text-[20px]">arrow_back</span>
        <span class="font-mono text-base font-semibold">Submit Visit Report</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <template v-else>
      <!-- Case Summary -->
      <div v-if="submission" class="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
        <span class="font-sans text-sm font-medium text-foreground">{{ submission.tenantName }}</span>
        <span class="font-sans text-[13px] text-muted-foreground">{{ submission.propertyAddress }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ submission.propertyType }} &bull; {{ submission.state }}</span>
      </div>

      <!-- Field Visit Checklist -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[13px] font-semibold text-foreground">Field Visit Checklist</span>
          <span class="font-mono text-[12px] text-muted-foreground">{{ checkedCount }}/{{ FIELD_CHECKLIST.length }}</span>
        </div>
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <button
            v-for="(item, i) in FIELD_CHECKLIST"
            :key="item.key"
            @click="toggleCheck(item.key)"
            class="flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-surface transition-colors cursor-pointer"
            :class="i < FIELD_CHECKLIST.length - 1 ? 'border-b border-border' : ''"
          >
            <span class="material-symbols-rounded text-[20px]" :class="checklistState[item.key] ? 'text-st-green-text' : 'text-muted-foreground'">
              {{ checklistState[item.key] ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <span class="font-sans text-[13px]" :class="checklistState[item.key] ? 'text-foreground' : 'text-muted-foreground'">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- Photo Evidence -->
      <div class="flex flex-col gap-2">
        <span class="font-mono text-[13px] font-semibold text-foreground">Photo Evidence <span class="font-normal text-muted-foreground">(max 10)</span></span>

        <button
          v-if="photos.length < 10"
          type="button"
          class="w-full py-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
          :class="{ 'opacity-50 pointer-events-none': uploading }"
          @click="fileInput?.click()">
          <span class="material-symbols-rounded text-[28px] text-muted-foreground">add_a_photo</span>
          <span class="font-sans text-sm text-muted-foreground">
            {{ uploading ? `Uploading... ${progress}%` : 'Click to upload visit photos' }}
          </span>
        </button>

        <div v-if="uploading" class="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${progress}%` }" />
        </div>

        <p v-if="uploadError" class="font-sans text-[13px] text-red-600">{{ uploadError }}</p>

        <div v-if="photos.length > 0" class="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
          <div v-for="(img, i) in photos" :key="img.key" class="relative group aspect-square rounded-lg overflow-hidden border border-border">
            <img :src="img.preview || img.publicUrl" class="w-full h-full object-cover" />
            <button
              type="button"
              class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removePhoto(i)"
             aria-label="Close">
              <span class="material-symbols-rounded text-[14px] text-white">close</span>
            </button>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="hidden"
          @change="handlePhotoSelect"
        />
      </div>

      <!-- Field Notes -->
      <div class="flex flex-col gap-2">
        <span class="font-mono text-[13px] font-semibold text-foreground">Field Notes <span class="text-red-500">*</span></span>
        <textarea
          v-model="notes"
          placeholder="Describe what you observed during the visit — property condition, tenant interaction, neighborhood environment, any concerns..."
          class="w-full h-28 px-3.5 py-3 bg-card border border-border rounded-xl text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
        />
      </div>

      <!-- Summary -->
      <div class="flex flex-col gap-2">
        <span class="font-mono text-[13px] font-semibold text-foreground">Summary <span class="font-normal text-muted-foreground">(optional)</span></span>
        <textarea
          v-model="summary"
          placeholder="Brief summary of your visit findings..."
          class="w-full h-20 px-3.5 py-3 bg-card border border-border rounded-xl text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
        />
      </div>

      <!-- Verification Result -->
      <div class="flex flex-col gap-2">
        <span class="font-mono text-[13px] font-semibold text-foreground">Verification Result</span>
        <div class="flex gap-2.5">
          <button
            @click="result = 'verified'"
            class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-mono font-semibold transition-colors"
            :class="result === 'verified' ? 'bg-st-green-bg border-[1.5px] border-st-green-text text-st-green-text' : 'bg-card border border-border text-muted-foreground'"
          >
            <span class="material-symbols-rounded text-[18px]">check_circle</span> Verified
          </button>
          <button
            @click="result = 'flagged'"
            class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-mono font-semibold transition-colors"
            :class="result === 'flagged' ? 'bg-st-red-bg border-[1.5px] border-st-red-text text-st-red-text' : 'bg-card border border-border text-muted-foreground'"
          >
            <span class="material-symbols-rounded text-[18px]">flag</span> Flagged
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="submitError" class="flex items-start gap-2.5 bg-st-red-bg border border-st-red-text/20 p-3.5 rounded-xl">
        <span class="material-symbols-rounded text-[18px] text-red-600 mt-0.5">error</span>
        <span class="font-sans text-[13px] text-red-600">{{ submitError }}</span>
      </div>

      <!-- Submit -->
      <button
        @click="handleSubmit"
        :disabled="submitting"
        class="flex items-center justify-center gap-2 h-12 bg-primary text-foreground rounded-xl font-mono text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        <span v-if="submitting" class="material-symbols-rounded text-[18px] animate-spin">progress_activity</span>
        <span v-else class="material-symbols-rounded text-[18px]">send</span>
        {{ submitting ? 'Submitting...' : 'Submit Visit Report' }}
      </button>
    </template>
  </div>
</template>
