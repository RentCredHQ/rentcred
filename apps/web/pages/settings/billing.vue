<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Payment & Billing — RentCred' })

const { getPaymentStats, getTransactionHistory } = usePayments()

const kpis = ref<any[]>([])
const invoices = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalInvoices = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalInvoices.value / 20)))

function goPage(dir: number) {
  const next = currentPage.value + dir
  if (next < 1 || next > totalPages.value) return
  currentPage.value = next
  fetchInvoices()
}

async function fetchInvoices() {
  try {
    const historyRes = await getTransactionHistory({ page: currentPage.value, limit: 20 })
    const txns = (historyRes as any)?.data ?? (Array.isArray(historyRes) ? historyRes : [])
    invoices.value = txns.map((tx: any) => {
      const statusLabel = tx.status === 'completed' ? 'Paid' : tx.status === 'pending' ? 'Pending' : tx.status || 'Pending'
      return {
        id: tx.id,
        date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        desc: tx.description || tx.type || '',
        amount: `₦${(tx.amount ?? 0).toLocaleString()}`,
        status: statusLabel,
        statusBg: statusLabel === 'Paid' ? 'bg-[#DFE6E1]' : 'bg-[#E9E3D8]',
        statusText: statusLabel === 'Paid' ? 'text-[#004D1A]' : 'text-[#804200]',
      }
    })
    totalInvoices.value = (historyRes as any)?.pagination?.total ?? invoices.value.length
  } catch { /* empty */ }
}

onMounted(async () => {
  try {
    const [statsRes, historyRes] = await Promise.all([
      getPaymentStats(),
      getTransactionHistory({ page: 1, limit: 20 }),
    ])
    if (statsRes) {
      // Backend getStats() returns { totalSpent, thisMonth, transactionCount }
      const s = statsRes as any
      kpis.value = [
        { label: 'TOTAL SPENT', value: `₦${(s.totalSpent ?? 0).toLocaleString()}`, sub: '', valueColor: 'text-foreground' },
        { label: 'THIS MONTH', value: `₦${(s.thisMonth ?? 0).toLocaleString()}`, sub: '', valueColor: 'text-[#804200]' },
        { label: 'TRANSACTIONS', value: String(s.transactionCount ?? 0), sub: '', valueColor: 'text-[#004D1A]' },
        { label: 'PAYMENT METHOD', value: 'Paystack', sub: '', valueColor: 'text-foreground', smallValue: true },
      ]
    }
    if (historyRes) {
      // Backend getHistory() returns { data: transactions[], pagination: {...} }
      const txns = (historyRes as any)?.data ?? (Array.isArray(historyRes) ? historyRes : [])
      invoices.value = txns.map((tx: any) => {
        const statusLabel = tx.status === 'completed' ? 'Paid' : tx.status === 'pending' ? 'Pending' : tx.status || 'Pending'
        return {
          id: tx.id,
          date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          desc: tx.description || tx.type || '',
          amount: `₦${(tx.amount ?? 0).toLocaleString()}`,
          status: statusLabel,
          statusBg: statusLabel === 'Paid' ? 'bg-[#DFE6E1]' : 'bg-[#E9E3D8]',
          statusText: statusLabel === 'Paid' ? 'text-[#004D1A]' : 'text-[#804200]',
        }
      })
      totalInvoices.value = (historyRes as any)?.pagination?.total ?? invoices.value.length
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/settings" class="lg:hidden">
        <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
      </NuxtLink>
      <h1 class="font-mono text-xl sm:text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Payment & Billing</h1>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-white border border-border rounded-lg p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono font-bold" :class="[kpi.valueColor, kpi.smallValue ? 'text-xl' : 'text-[28px]']">{{ kpi.value }}</span>
        <span class="font-sans text-[12px] text-muted-foreground">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Invoice Table -->
    <div class="bg-white border border-border rounded-lg overflow-hidden">
      <!-- Title -->
      <div class="flex items-center justify-between px-6 py-4">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">INVOICE HISTORY</span>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Invoice</span></div>
          <div class="w-[140px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Date</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Description</span></div>
          <div class="w-[120px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Amount</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[80px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <!-- Empty State -->
        <div v-if="invoices.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">receipt_long</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No billing history</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Your invoices will appear here</p>
          </div>
        </div>

        <div v-for="inv in invoices" :key="inv.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[160px]"><span class="font-mono text-[13px] text-foreground font-medium truncate block" :title="inv.id">{{ inv.id.slice(0, 10) }}…</span></div>
          <div class="w-[140px]"><span class="font-sans text-[13px] text-muted-foreground">{{ inv.date }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-foreground">{{ inv.desc }}</span></div>
          <div class="w-[120px]"><span class="font-mono text-sm font-medium text-foreground">{{ inv.amount }}</span></div>
          <div class="w-[100px]">
            <UiStatusPill :status="inv.status" :label="inv.status" />
          </div>
          <div class="w-[80px]">
            <span class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">download</span>
          </div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div v-if="invoices.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="w-16 h-16 rounded-full bg-[#E7E8E5] flex items-center justify-center">
            <span class="material-symbols-rounded text-[28px] text-muted-foreground">receipt_long</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <h3 class="font-mono text-base font-semibold text-foreground">No billing history</h3>
            <p class="font-sans text-sm text-muted-foreground text-center max-w-[320px]">Your invoices will appear here</p>
          </div>
        </div>
        <div v-for="inv in invoices" :key="inv.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1">
            <span class="font-sans text-sm font-medium text-foreground">{{ inv.desc }}</span>
            <span class="font-mono text-sm font-medium text-foreground">{{ inv.amount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-sans text-[12px] text-muted-foreground">{{ inv.date }} · {{ inv.id }}</span>
            <UiStatusPill :status="inv.status" :label="inv.status" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ invoices.length }} of {{ totalInvoices }} invoices</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(-1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <span class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">{{ currentPage }}</span>
          <button @click="goPage(1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
