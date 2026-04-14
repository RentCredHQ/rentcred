<script setup lang="ts">
const show = defineModel<boolean>({ default: false })
const props = defineProps<{ dispute: any }>()
const emit = defineEmits<{ resolved: [] }>()

const { resolveDispute } = useDisputes()
const isSubmitting = ref(false)
const resolution = ref('')
const error = ref<string | null>(null)

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'resolved': case 'closed': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'under_review': return 'bg-blue-50 text-blue-600'
    default: return 'bg-[#E9E3D8] text-[#804200]'
  }
}

function statusLabel(status: string) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || ''
}

async function handleAction(status: string) {
  if (!props.dispute) return
  isSubmitting.value = true
  error.value = null
  try {
    await resolveDispute(props.dispute.id, {
      status,
      resolution: resolution.value || undefined,
    })
    show.value = false
    resolution.value = ''
    emit('resolved')
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to update dispute'
  } finally {
    isSubmitting.value = false
  }
}

watch(show, (val) => {
  if (!val) {
    resolution.value = ''
    error.value = null
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show && dispute" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="show = false" />
        <div class="relative bg-card rounded-xl border border-border shadow-lg w-full mx-4 max-w-lg max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[20px] text-primary">gavel</span>
              <div>
                <h3 class="font-mono text-base font-semibold text-foreground">Dispute Detail</h3>
                <span class="font-sans text-[12px] text-muted-foreground">Filed {{ new Date(dispute.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
              </div>
            </div>
            <button @click="show = false" class="text-muted-foreground hover:text-foreground">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <div class="flex flex-col gap-5 p-6">
            <!-- Status -->
            <div class="flex items-center gap-3">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClasses(dispute.status)">{{ statusLabel(dispute.status) }}</span>
            </div>

            <!-- Parties -->
            <div class="bg-background rounded-lg p-4 flex flex-col gap-2">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PARTIES INVOLVED</span>
              <div class="flex items-center gap-3">
                <div class="flex flex-col">
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ dispute.raisedBy?.name }}</span>
                  <span class="font-sans text-[11px] text-muted-foreground capitalize">{{ dispute.raisedBy?.role?.replace('_', ' ') }} (filed by)</span>
                </div>
                <span class="material-symbols-rounded text-[16px] text-muted-foreground">swap_horiz</span>
                <div class="flex flex-col">
                  <span class="font-sans text-[13px] font-medium text-foreground">{{ dispute.submission?.agent?.name || 'Agent' }}</span>
                  <span class="font-sans text-[11px] text-muted-foreground">Agent</span>
                </div>
              </div>
            </div>

            <!-- Submission -->
            <div class="flex flex-col gap-1.5">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">SUBMISSION</span>
              <span class="font-sans text-[13px] text-foreground">{{ dispute.submission?.tenantName }} — {{ dispute.submission?.propertyAddress }}</span>
            </div>

            <!-- Reason -->
            <div class="flex flex-col gap-1.5">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">REASON</span>
              <span class="font-sans text-[13px] font-semibold text-foreground">{{ dispute.reason }}</span>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">DESCRIPTION</span>
              <p class="font-sans text-[13px] text-foreground leading-relaxed">{{ dispute.description }}</p>
            </div>

            <!-- Existing Resolution -->
            <div v-if="dispute.resolution" class="bg-[#DFE6E1] rounded-lg p-4 flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-[#004D1A] tracking-wider">RESOLUTION</span>
              <p class="font-sans text-[13px] text-[#004D1A]">{{ dispute.resolution }}</p>
            </div>

            <!-- Resolution Form (only for open/under_review disputes) -->
            <div v-if="!['resolved', 'closed'].includes(dispute.status)" class="flex flex-col gap-3 pt-2 border-t border-border">
              <div class="flex flex-col gap-1.5">
                <label class="font-sans text-[13px] font-medium text-foreground">Resolution Note</label>
                <textarea
                  v-model="resolution"
                  rows="3"
                  placeholder="Describe the resolution or action taken..."
                  class="w-full px-3.5 py-3 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div v-if="error" class="font-sans text-[13px] text-error">{{ error }}</div>

              <!-- Actions -->
              <div class="flex flex-wrap items-center gap-3">
                <button
                  v-if="dispute.status === 'open'"
                  class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  :disabled="isSubmitting"
                  @click="handleAction('under_review')"
                >
                  Mark Under Review
                </button>
                <button
                  class="flex-1 px-4 py-2.5 bg-[#004D1A] text-white rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  :disabled="isSubmitting || !resolution"
                  @click="handleAction('resolved')"
                >
                  {{ isSubmitting ? 'Saving...' : 'Resolve' }}
                </button>
                <button
                  class="px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors"
                  :disabled="isSubmitting"
                  @click="handleAction('closed')"
                >
                  Close
                </button>
              </div>
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
