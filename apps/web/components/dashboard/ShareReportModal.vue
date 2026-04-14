<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; reportId?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
const close = () => emit('update:modelValue', false)

const { shareReport } = useReports()

const shareLink = ref('')
const email = ref('')
const permission = ref('View only')
const requireAuth = ref(true)
const sending = ref(false)
const linkLoading = ref(false)

watch(() => props.modelValue, async (open) => {
  if (open && props.reportId) {
    linkLoading.value = true
    try {
      const res = await shareReport(props.reportId)
      shareLink.value = res.shareUrl || `https://app.rentcred.ng/report/${props.reportId}`
    } catch {
      shareLink.value = `https://app.rentcred.ng/report/${props.reportId}`
    } finally {
      linkLoading.value = false
    }
  }
})

function copyLink() {
  navigator.clipboard.writeText(shareLink.value)
}

async function sendEmail() {
  if (!email.value || !props.reportId) return
  sending.value = true
  try {
    await shareReport(props.reportId, { email: email.value })
    email.value = ''
    close()
  } catch { /* empty */ }
  finally { sending.value = false }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative w-full mx-4 max-w-[480px] max-h-[90vh] bg-white rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 class="font-mono text-lg font-bold text-foreground">Share Report</h2>
            <button @click="close" class="w-8 h-8 rounded-lg bg-[#E7E8E5] flex items-center justify-center hover:bg-border transition-colors">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex flex-col gap-6 p-6 overflow-y-auto">
            <!-- Share via link -->
            <div class="flex flex-col gap-2.5">
              <label class="font-sans text-sm font-semibold text-foreground">Share via link</label>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-10 px-3 flex items-center rounded-lg bg-[#E7E8E5] border border-border overflow-hidden">
                  <span class="font-sans text-xs text-muted-foreground truncate">{{ shareLink }}</span>
                </div>
                <button @click="copyLink" class="h-10 px-4 flex items-center gap-1.5 rounded-lg bg-foreground text-white font-sans text-[13px] font-medium hover:bg-foreground/90 transition-colors flex-shrink-0">
                  <span class="material-symbols-rounded text-[16px]">content_copy</span>
                  Copy
                </button>
              </div>
            </div>

            <!-- Share via email -->
            <div class="flex flex-col gap-2.5">
              <label class="font-sans text-sm font-semibold text-foreground">Share via email</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="email"
                  type="email"
                  placeholder="Enter email address"
                  class="flex-1 h-10 px-3 rounded-lg border border-border bg-transparent font-sans text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button @click="sendEmail" class="h-10 px-4 flex items-center gap-1.5 rounded-lg bg-primary text-white font-sans text-[13px] font-medium hover:bg-primary/90 transition-colors flex-shrink-0">
                  <span class="material-symbols-rounded text-[16px]">send</span>
                  Send
                </button>
              </div>
            </div>

            <!-- Permissions -->
            <div class="flex flex-col gap-2.5">
              <label class="font-sans text-sm font-semibold text-foreground">Permissions</label>
              <div class="relative">
                <select
                  v-model="permission"
                  class="w-full h-10 px-3 pr-8 rounded-lg border border-border bg-transparent font-sans text-[13px] text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option>View only</option>
                  <option>Can download</option>
                  <option>Full access</option>
                </select>
                <span class="material-symbols-rounded text-[18px] text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">keyboard_arrow_down</span>
              </div>
            </div>

            <!-- Auth toggle -->
            <div class="flex items-center justify-between">
              <span class="font-sans text-[13px] text-foreground">Require authentication</span>
              <button
                @click="requireAuth = !requireAuth"
                class="w-11 h-6 rounded-full transition-colors relative"
                :class="requireAuth ? 'bg-primary' : 'bg-border'"
              >
                <div
                  class="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform"
                  :class="requireAuth ? 'translate-x-[22px]' : 'translate-x-0.5'"
                />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-5 border-t border-border">
            <button @click="close" class="h-10 px-5 rounded-lg border border-border font-sans text-[13px] font-medium text-foreground hover:bg-background transition-colors">
              Cancel
            </button>
            <button class="h-10 px-5 flex items-center gap-1.5 rounded-lg bg-primary text-white font-sans text-[13px] font-medium hover:bg-primary/90 transition-colors">
              <span class="material-symbols-rounded text-[16px]">share</span>
              Share
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
