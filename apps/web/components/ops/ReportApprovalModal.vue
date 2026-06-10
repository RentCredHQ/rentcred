<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; reportId?: string | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'reviewed'): void
}>()

const { getReport, reviewReport } = useReports()

const close = () => emit('update:modelValue', false)

const caseInfo = ref({ caseId: '', tenantName: '', agent: '' })
const feedback = ref('')
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)

watch(() => props.modelValue, async (open) => {
  if (!open || !props.reportId) return
  loading.value = true
  feedback.value = ''
  error.value = null
  try {
    const res = await getReport(props.reportId)
    const r = res.data ?? res
    caseInfo.value = {
      caseId: r.submissionId ?? r.id ?? '',
      tenantName: r.content?.tenant?.name ?? r.submission?.tenantName ?? '',
      agent: r.submission?.agent?.name ?? '',
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load report details.'
  } finally { loading.value = false }
})

async function approveReport() {
  if (!props.reportId) return
  actionLoading.value = true
  error.value = null
  try {
    await reviewReport(props.reportId, { status: 'approved', notes: feedback.value })
    emit('reviewed')
    close()
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to approve report. Please try again.'
  } finally { actionLoading.value = false }
}

async function requestRevisions() {
  if (!feedback.value.trim() || !props.reportId) return
  actionLoading.value = true
  error.value = null
  try {
    await reviewReport(props.reportId, { status: 'rejected', notes: feedback.value })
    emit('reviewed')
    close()
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to request revisions. Please try again.'
  } finally { actionLoading.value = false }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-24 px-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Modal -->
        <div class="relative w-full mx-4 max-w-[440px] bg-card rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
            <h2 class="font-mono text-[16px] font-bold text-foreground">Review &amp; Approve Report</h2>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-border transition-colors" aria-label="Close">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            <!-- Case Information Card -->
            <div class="bg-surface rounded-[10px] p-4 flex flex-col gap-3">
              <span class="font-sans text-[13px] font-semibold text-foreground">Case Information</span>
              <div class="flex justify-between">
                <span class="font-sans text-[12px] text-muted-foreground">Case ID</span>
                <span class="font-mono text-[12px] font-medium text-foreground">{{ caseInfo.caseId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[12px] text-muted-foreground">Tenant Name</span>
                <span class="font-sans text-[12px] font-medium text-foreground">{{ caseInfo.tenantName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[12px] text-muted-foreground">Agent</span>
                <span class="font-sans text-[12px] font-medium text-foreground">{{ caseInfo.agent }}</span>
              </div>
            </div>

            <!-- Approve Card -->
            <div class="border border-border rounded-[10px] p-4 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-st-green-bg flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-rounded text-[20px] text-st-green-text">check_circle</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-sans text-[14px] font-semibold text-foreground">Approve Report</span>
                  <span class="font-sans text-[12px] text-muted-foreground">Mark this report as verified and complete</span>
                </div>
              </div>
              <button
                @click="approveReport"
                :disabled="actionLoading"
                class="flex items-center justify-center gap-2 w-full h-10 bg-st-green-text text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="actionLoading" class="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
                <span v-else class="material-symbols-rounded text-[16px]">check</span>
                <span class="font-sans text-[13px] font-semibold">{{ actionLoading ? 'Approving...' : 'Approve Report' }}</span>
              </button>
            </div>

            <!-- Revise Card -->
            <div class="border border-border rounded-[10px] p-4 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-st-amber-bg flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-rounded text-[20px] text-st-amber-text">edit_note</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-sans text-[14px] font-semibold text-foreground">Request Revisions</span>
                  <span class="font-sans text-[12px] text-muted-foreground">Send back with feedback for the agent</span>
                </div>
              </div>
              <textarea
                v-model="feedback"
                placeholder="Enter feedback for the agent..."
                class="w-full h-20 px-3 py-3 border border-border rounded-lg bg-card text-[12px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <button
                @click="requestRevisions"
                :disabled="!feedback.trim() || actionLoading"
                class="flex items-center justify-center gap-2 w-full h-10 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="actionLoading" class="material-symbols-rounded text-[16px] animate-spin">progress_activity</span>
                <span v-else class="material-symbols-rounded text-[16px]">send</span>
                <span class="font-sans text-[13px] font-semibold">{{ actionLoading ? 'Sending...' : 'Request Revisions' }}</span>
              </button>
            </div>

            <!-- Error -->
            <div v-if="error" class="font-sans text-[13px] text-st-red-text">{{ error }}</div>

            <!-- Cancel Link -->
            <div class="flex justify-center py-1">
              <button @click="close" class="font-sans text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
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
