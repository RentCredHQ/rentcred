<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; reportId?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
const close = () => emit('update:modelValue', false)

const { shareReport } = useReports()

const shareLink = ref('')
const linkLoading = ref(false)
const error = ref('')
const copied = ref(false)

watch(() => props.modelValue, async (open) => {
  if (!open) {
    error.value = ''
    copied.value = false
    return
  }

  // No report id means the parent has nothing to share — say so rather than
  // showing an empty box with a Copy button that copies nothing.
  if (!props.reportId) {
    error.value = 'No report is available for this case yet.'
    shareLink.value = ''
    return
  }

  linkLoading.value = true
  error.value = ''
  try {
    const res = await shareReport(props.reportId)
    shareLink.value = res.shareUrl || ''
    if (!shareLink.value) error.value = 'Could not create a share link.'
  } catch (e: any) {
    shareLink.value = ''
    error.value = e.data?.message || 'Could not create a share link.'
  } finally {
    linkLoading.value = false
  }
})

async function copyLink() {
  if (!shareLink.value) return
  try {
    await navigator.clipboard.writeText(shareLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    error.value = 'Copy failed — select the link and copy it manually.'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative w-full mx-4 max-w-[480px] max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 class="font-mono text-lg font-bold text-foreground">Share Report</h2>
            <button @click="close" class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-border transition-colors" aria-label="Close">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex flex-col gap-6 p-6 overflow-y-auto">
            <div v-if="error" class="bg-st-red-bg text-st-red-text font-sans text-[13px] px-4 py-3 rounded-lg">
              {{ error }}
            </div>

            <div class="flex flex-col gap-2.5">
              <label class="font-sans text-sm font-semibold text-foreground">Share via link</label>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-10 px-3 flex items-center rounded-lg bg-surface border border-border overflow-hidden">
                  <span class="font-sans text-xs text-muted-foreground truncate">
                    {{ linkLoading ? 'Creating link…' : (shareLink || '—') }}
                  </span>
                </div>
                <button
                  @click="copyLink"
                  :disabled="!shareLink || linkLoading"
                  class="h-10 px-4 flex items-center gap-1.5 rounded-lg bg-foreground text-background font-sans text-[13px] font-medium hover:bg-foreground/90 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span class="material-symbols-rounded text-[16px]">{{ copied ? 'check' : 'content_copy' }}</span>
                  {{ copied ? 'Copied' : 'Copy' }}
                </button>
              </div>
              <p class="font-sans text-xs text-muted-foreground">
                Anyone with this link can view the verification outcome. Personal contact
                details and field visit photos are not included.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-5 border-t border-border">
            <button @click="close" class="h-10 px-5 rounded-lg bg-primary text-foreground font-sans text-[13px] font-medium hover:opacity-90 transition-opacity">
              Done
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
