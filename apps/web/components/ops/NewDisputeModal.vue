<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const close = () => emit('update:modelValue', false)

const { createDispute } = useDisputes()

const form = ref({
  caseId: '',
  category: 'Data Accuracy',
  priority: 'High',
  subject: '',
  description: '',
})

const categories = ['Data Accuracy', 'Identity Mismatch', 'Employment Discrepancy', 'Address Verification', 'Reference Conflict', 'Other']
const priorities = ['Low', 'Medium', 'High', 'Critical']

const submitting = ref(false)
const error = ref<string | null>(null)

const canSubmit = computed(() => form.value.subject && form.value.description)

watch(() => props.modelValue, (val) => {
  if (val) {
    error.value = null
  }
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = null
  try {
    await createDispute({
      submissionId: form.value.caseId,
      reason: `[${form.value.category}] ${form.value.subject}`,
      description: form.value.description,
    })
    close()
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to submit dispute. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Modal -->
        <div class="relative w-full mx-4 max-w-md bg-card rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h2 class="font-mono text-[16px] font-bold text-foreground">File a Dispute</h2>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-border transition-colors" aria-label="Close">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <!-- Case ID -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Related Case ID</label>
              <input
                v-model="form.caseId"
                type="text"
                placeholder="e.g. RC-2026-00389"
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-card text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- Category -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Category</label>
              <select
                v-model="form.category"
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-card text-[13px] font-sans text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Priority</label>
              <select
                v-model="form.priority"
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-card text-[13px] font-sans text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <!-- Subject -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Subject</label>
              <input
                v-model="form.subject"
                type="text"
                placeholder="Brief summary of the issue"
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-card text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Description</label>
              <textarea
                v-model="form.description"
                placeholder="Provide details about the dispute..."
                class="w-full h-[120px] px-3.5 py-3 border border-border rounded-lg bg-card text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              />
            </div>

            <!-- Attachments -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Attachments</label>
              <div class="w-full h-[100px] border border-dashed border-border rounded-lg bg-card flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-background transition-colors">
                <span class="material-symbols-rounded text-[28px] text-muted-foreground">cloud_upload</span>
                <span class="font-sans text-[13px] text-muted-foreground">Click to upload files</span>
                <span class="font-sans text-[11px] text-muted-foreground/60">PNG, JPG, PDF up to 10MB</span>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="px-5 pb-2">
            <div class="font-sans text-[13px] text-st-red-text">{{ error }}</div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-5 py-4 border-t border-border flex-shrink-0">
            <button @click="close" :disabled="submitting" class="px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans font-medium text-foreground hover:bg-background transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button @click="submit" :disabled="submitting || !canSubmit" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="submitting" class="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
              <span v-else class="material-symbols-rounded text-[16px]">send</span>
              {{ submitting ? 'Submitting...' : 'Submit Dispute' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
