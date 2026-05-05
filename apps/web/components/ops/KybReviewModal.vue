<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; applicationId?: string | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'reviewed'): void
}>()

const { getKybApplication, reviewKyb } = useKyb()

const close = () => emit('update:modelValue', false)

const company = ref({ name: '', rcNumber: '', director: '', status: '' })
const documents = ref<any[]>([])
const reviewNotes = ref('')
const loading = ref(false)
const actionLoading = ref(false)

watch(() => props.modelValue, async (open) => {
  if (!open || !props.applicationId) return
  loading.value = true
  reviewNotes.value = ''
  try {
    const res = await getKybApplication(props.applicationId)
    const app = res.data ?? res
    company.value = {
      name: app.companyName ?? '',
      rcNumber: app.rcNumber ?? '',
      director: app.agentProfile?.user?.name ?? '',
      status: app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending Review',
    }
    // Build documents list from individual URL fields
    const docEntries = [
      { name: 'CAC Certificate', url: app.cacDocument },
      { name: 'Director ID', url: app.directorIdUrl },
      { name: 'Utility Bill', url: app.utilityBillUrl },
    ]
    documents.value = docEntries.map((d) => {
      const uploaded = !!d.url
      return {
        name: d.name,
        url: d.url,
        status: uploaded ? 'uploaded' : 'missing',
        detail: uploaded ? 'Uploaded — click to view' : 'Not provided',
        icon: uploaded ? 'description' : 'cancel',
        iconColor: uploaded ? 'text-[#004D1A]' : 'text-[#991B1B]',
      }
    })
  } catch { /* empty */ }
  finally { loading.value = false }
})

async function approve() {
  if (!props.applicationId) return
  actionLoading.value = true
  try {
    await reviewKyb(props.applicationId, { status: 'approved', reviewNotes: reviewNotes.value })
    emit('reviewed')
    close()
  } catch { /* empty */ }
  finally { actionLoading.value = false }
}

async function reject() {
  if (!props.applicationId) return
  actionLoading.value = true
  try {
    await reviewKyb(props.applicationId, { status: 'rejected', reviewNotes: reviewNotes.value })
    emit('reviewed')
    close()
  } catch { /* empty */ }
  finally { actionLoading.value = false }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4" @click.self="close">
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <div class="relative w-full mx-4 max-w-lg bg-white rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
              <h2 class="font-mono text-[16px] font-bold text-foreground">KYB Review</h2>
            </div>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E7E8E5] hover:bg-border transition-colors">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <!-- Company Info -->
            <div class="bg-white border border-border rounded-xl p-4 flex flex-col gap-2.5">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY INFORMATION</span>
              <span class="font-mono text-[15px] font-bold text-foreground">{{ company.name }}</span>
              <div class="flex justify-between">
                <span class="font-sans text-[12px] text-muted-foreground">RC Number</span>
                <span class="font-sans text-[12px] font-medium text-foreground">{{ company.rcNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[12px] text-muted-foreground">Director</span>
                <span class="font-sans text-[12px] font-medium text-foreground">{{ company.director }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-sans text-[12px] text-muted-foreground">Status</span>
                <span class="inline-flex px-2 py-0.5 rounded bg-[#E9E3D8] text-[11px] font-semibold text-[#804200]">{{ company.status }}</span>
              </div>
            </div>

            <!-- Document Checklist -->
            <span class="font-mono text-[13px] font-semibold text-foreground">Document Checklist</span>
            <div class="bg-white border border-border rounded-xl overflow-hidden">
              <component
                :is="doc.url ? 'a' : 'div'"
                v-for="(doc, idx) in documents"
                :key="doc.name"
                :href="doc.url || undefined"
                :target="doc.url ? '_blank' : undefined"
                :rel="doc.url ? 'noopener' : undefined"
                class="flex items-center gap-3 px-4 py-3"
                :class="[idx < documents.length - 1 ? 'border-b border-border' : '', doc.url ? 'hover:bg-surface/50 cursor-pointer' : '']"
              >
                <span class="material-symbols-rounded text-[20px]" :class="doc.iconColor">{{ doc.icon }}</span>
                <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ doc.name }}</span>
                  <span class="font-sans text-[11px]" :class="doc.status === 'missing' ? 'text-[#991B1B]' : 'text-muted-foreground'">
                    {{ doc.detail }}
                  </span>
                </div>
                <span v-if="doc.url" class="material-symbols-rounded text-[16px] text-muted-foreground">open_in_new</span>
              </component>
            </div>

            <!-- Review Notes -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Review Notes</label>
              <textarea
                v-model="reviewNotes"
                placeholder="Add notes about this KYB review..."
                class="w-full h-20 px-3.5 py-3 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button @click="reject" class="flex-1 flex items-center justify-center gap-2 h-12 border-[1.5px] border-[#991B1B] rounded-lg text-[13px] font-mono font-semibold text-[#991B1B] hover:bg-[#FDECEC] transition-colors">
                <span class="material-symbols-rounded text-[18px]">close</span>
                Reject
              </button>
              <button @click="approve" class="flex-1 flex items-center justify-center gap-2 h-12 bg-[#004D1A] rounded-lg text-[13px] font-mono font-semibold text-white hover:opacity-90 transition-opacity">
                <span class="material-symbols-rounded text-[18px]">check</span>
                Approve
              </button>
            </div>
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
