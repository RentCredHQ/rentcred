<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const close = () => emit('update:modelValue', false)

const form = ref({
  caseId: '',
  category: 'Data Accuracy',
  priority: 'High',
  subject: '',
  description: '',
})

const categories = ['Data Accuracy', 'Identity Mismatch', 'Employment Discrepancy', 'Address Verification', 'Reference Conflict', 'Other']
const priorities = ['Low', 'Medium', 'High', 'Critical']

function submit() {
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Modal -->
        <div class="relative w-full mx-4 max-w-md bg-white rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h2 class="font-mono text-[16px] font-bold text-foreground">File a Dispute</h2>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E7E8E5] hover:bg-border transition-colors">
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
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- Category -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Category</label>
              <select
                v-model="form.category"
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Priority</label>
              <select
                v-model="form.priority"
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
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
                class="w-full h-11 px-3.5 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Description</label>
              <textarea
                v-model="form.description"
                placeholder="Provide details about the dispute..."
                class="w-full h-[120px] px-3.5 py-3 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              />
            </div>

            <!-- Attachments -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Attachments</label>
              <div class="w-full h-[100px] border border-dashed border-border rounded-lg bg-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-background transition-colors">
                <span class="material-symbols-rounded text-[28px] text-muted-foreground">cloud_upload</span>
                <span class="font-sans text-[13px] text-muted-foreground">Click to upload files</span>
                <span class="font-sans text-[11px] text-muted-foreground/60">PNG, JPG, PDF up to 10MB</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-5 py-4 border-t border-border flex-shrink-0">
            <button @click="close" class="px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans font-medium text-foreground hover:bg-background transition-colors">
              Cancel
            </button>
            <button @click="submit" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity">
              <span class="material-symbols-rounded text-[16px]">send</span>
              Submit Dispute
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
