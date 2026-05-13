<script setup lang="ts">
const show = defineModel<boolean>({ default: false })
const props = defineProps<{ transactionId?: string | null }>()

const { api } = useApi()

const loading = ref(false)
const error = ref<string | null>(null)

const txn = ref({
  id: '',
  date: '',
  amount: '₦0',
  status: '',
  statusBg: 'bg-[#E9E3D8]',
  statusText: 'text-[#804200]',
  type: '',
  caseId: '',
  tenant: '',
  agent: '',
  method: '',
  reference: '',
  commission: '',
})

const statusStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  processed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]', label: 'Processed' },
  completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]', label: 'Processed' },
  pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]', label: 'Pending' },
  failed: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]', label: 'Failed' },
}

watch(() => show.value, async (open) => {
  if (!open || !props.transactionId) return
  loading.value = true
  error.value = null
  try {
    const res = await api<any>(`/payments/${props.transactionId}`)
    const t = res.data ?? res
    const style = statusStyleMap[t.status] ?? statusStyleMap.pending
    txn.value = {
      id: t.id ?? '',
      date: t.createdAt ? new Date(t.createdAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      amount: `₦${(t.amount ?? 0).toLocaleString('en-NG')}`,
      status: style.label,
      statusBg: style.bg,
      statusText: style.text,
      type: t.type ?? '',
      caseId: t.submissionId ?? t.caseId ?? '',
      tenant: t.tenantName ?? '',
      agent: t.agentName ?? t.agent?.name ?? '',
      method: t.method ?? 'Bank Transfer',
      reference: t.reference ?? t.id ?? '',
      commission: t.commission ? `₦${t.commission.toLocaleString('en-NG')}` : '',
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load transaction details.'
  } finally { loading.value = false }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="show = false" />
        <div class="relative bg-card rounded-xl border border-border shadow-lg w-full mx-4 max-w-md max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
            <div>
              <h3 class="font-mono text-base font-semibold text-foreground">{{ txn.id ? txn.id.slice(0, 12) : 'Transaction' }}</h3>
              <span class="font-sans text-[12px] text-muted-foreground">{{ txn.date }}</span>
            </div>
            <button @click="show = false" class="text-muted-foreground hover:text-foreground">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="p-6">
            <div class="font-sans text-[13px] text-[#8C1C00]">{{ error }}</div>
          </div>

          <div v-else class="flex flex-col gap-5 p-6">
            <!-- Amount & Status -->
            <div class="flex items-center justify-between">
              <span class="font-mono text-2xl font-bold text-foreground">{{ txn.amount }}</span>
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[txn.statusBg, txn.statusText]">{{ txn.status }}</span>
            </div>

            <!-- Details -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Type</span>
                <span class="font-sans text-[13px] text-foreground">{{ txn.type }}</span>
              </div>
              <div v-if="txn.caseId" class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Case ID</span>
                <span class="font-mono text-[13px] text-foreground">{{ txn.caseId.slice(0, 12) }}</span>
              </div>
              <div v-if="txn.tenant" class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Tenant</span>
                <span class="font-sans text-[13px] text-foreground">{{ txn.tenant }}</span>
              </div>
              <div v-if="txn.agent" class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Agent</span>
                <span class="font-sans text-[13px] text-foreground">{{ txn.agent }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Payment Method</span>
                <span class="font-sans text-[13px] text-foreground">{{ txn.method }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Reference</span>
                <span class="font-mono text-[12px] text-foreground">{{ txn.reference }}</span>
              </div>
              <div v-if="txn.commission" class="flex items-center justify-between py-2">
                <span class="font-sans text-[13px] text-muted-foreground">Commission</span>
                <span class="font-mono text-[13px] font-semibold text-primary">{{ txn.commission }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button class="flex-1 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors flex items-center justify-center gap-2">
                <span class="material-symbols-rounded text-[16px]">receipt_long</span>
                Download Receipt
              </button>
              <button @click="show = false" class="px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
                Close
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
