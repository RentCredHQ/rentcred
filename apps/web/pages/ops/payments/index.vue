<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Payments Management — RentCred Ops' })

const { getTransactionHistory, getPaymentStats } = usePayments()

const showTransaction = ref(false)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Processed', value: 'Processed' },
  { label: 'Failed', value: 'Failed' },
]

const statusStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  processed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]', label: 'Processed' },
  completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]', label: 'Processed' },
  pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]', label: 'Pending' },
  failed: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]', label: 'Failed' },
}

function formatNaira(val: number) {
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`
  return `₦${val.toLocaleString('en-NG')}`
}

const kpis = ref([
  { label: 'TOTAL REVENUE', value: '—', sub: '', valueColor: 'text-foreground', subColor: '' },
  { label: 'PENDING PAYOUTS', value: '—', sub: '', valueColor: 'text-primary', subColor: '' },
  { label: 'AGENT COMMISSIONS', value: '—', sub: '', valueColor: 'text-[#004D1A]', subColor: '' },
  { label: 'FAILED PAYMENTS', value: '—', sub: '', valueColor: 'text-[#8C1C00]', subColor: 'text-[#8C1C00]' },
])

const transactions = ref<any[]>([])
const totalTransactions = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(true)

async function fetchPayments(page = 1) {
  loading.value = true
  try {
    const [historyRes, statsRes] = await Promise.all([
      getTransactionHistory({ page, limit: 20 }),
      getPaymentStats(),
    ])

    // Map stats
    const s = statsRes.data ?? statsRes ?? {}
    kpis.value = [
      { label: 'TOTAL REVENUE', value: formatNaira(s.totalRevenue ?? 0), sub: s.revenueChange ?? '', valueColor: 'text-foreground', subColor: 'text-[#004D1A]' },
      { label: 'PENDING PAYOUTS', value: formatNaira(s.pendingPayouts ?? 0), sub: s.pendingCount ? `${s.pendingCount} transactions queued` : '', valueColor: 'text-primary', subColor: '' },
      { label: 'AGENT COMMISSIONS', value: formatNaira(s.agentCommissions ?? 0), sub: s.commissionsLabel ?? '', valueColor: 'text-[#004D1A]', subColor: '' },
      { label: 'FAILED PAYMENTS', value: String(s.failedCount ?? 0), sub: s.failedCount ? 'Requires attention' : '', valueColor: 'text-[#8C1C00]', subColor: 'text-[#8C1C00]' },
    ]

    // Map transactions
    const items = historyRes.data ?? []
    const pagination = historyRes.pagination ?? {}
    totalTransactions.value = pagination.total ?? items.length
    currentPage.value = pagination.page ?? page
    totalPages.value = pagination.totalPages ?? 1

    const typeLabelMap: Record<string, string> = {
      purchase: 'Verification', deduction: 'Commission', refund: 'Refund',
    }

    transactions.value = items.map((txn: any) => {
      const style = statusStyleMap[txn.status] ?? statusStyleMap.pending
      return {
        id: txn.id,
        agent: txn.agentName ?? txn.agent?.name ?? '',
        business: txn.businessName ?? txn.agent?.businessName ?? '',
        type: typeLabelMap[txn.type] ?? txn.type ?? '',
        amount: `₦${(txn.amount ?? 0).toLocaleString('en-NG')}`,
        status: style.label,
        statusBg: style.bg,
        statusText: style.text,
        date: txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—',
      }
    })
  } catch { /* empty */ }
  finally { loading.value = false }
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchPayments(page)
}

onMounted(() => fetchPayments())

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: transactions,
  searchFields: ['id', 'agent', 'business', 'type'],
  statusField: 'status',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Payments Management</h1>
        <span class="font-sans text-sm text-muted-foreground">Track agent payments, commissions and billing</span>
      </div>
      <button class="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
        <span class="material-symbols-rounded text-[16px]">download</span>
        Export
      </button>
    </div>

    <!-- Tabs & Search -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search payments..." />
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">{{ kpi.label }}</span>
        <span class="font-mono text-[28px] font-bold" :class="kpi.valueColor">{{ kpi.value }}</span>
        <span class="font-sans text-[12px]" :class="kpi.subColor || 'text-muted-foreground'">{{ kpi.sub }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-semibold text-foreground">Payment Transactions</span>
          <span class="px-2.5 py-0.5 bg-background rounded-full text-[12px] font-mono font-semibold text-muted-foreground">{{ resultCount }}</span>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="w-[120px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Transaction ID</span></div>
          <div class="w-[160px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Agent / Business</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Type</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Amount</span></div>
          <div class="w-[100px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
          <div class="w-[90px]"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Date</span></div>
          <div class="flex-1"><span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">Action</span></div>
        </div>

        <div v-for="txn in filtered" :key="txn.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[120px]"><span class="font-mono text-[12px] font-medium text-foreground">{{ txn.id }}</span></div>
          <div class="w-[160px]">
            <span class="font-sans text-[13px] font-medium text-foreground block">{{ txn.agent }}</span>
            <span class="font-sans text-[11px] text-muted-foreground">{{ txn.business }}</span>
          </div>
          <div class="w-[100px]"><span class="font-sans text-[13px] text-foreground">{{ txn.type }}</span></div>
          <div class="w-[100px]"><span class="font-mono text-[13px] font-medium text-foreground">{{ txn.amount }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="[txn.statusBg, txn.statusText]">{{ txn.status }}</span>
          </div>
          <div class="w-[90px]"><span class="font-sans text-[13px] text-foreground">{{ txn.date }}</span></div>
          <div class="flex-1">
            <span @click="showTransaction = true" class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">visibility</span>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="lg:hidden">
        <div v-for="txn in filtered" :key="txn.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-mono text-[13px] font-medium text-foreground">{{ txn.id }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[txn.statusBg, txn.statusText]">{{ txn.status }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-sans text-sm text-foreground">{{ txn.agent }}</span>
            <span class="font-mono text-sm font-medium text-foreground">{{ txn.amount }}</span>
          </div>
          <div class="flex items-center gap-3 text-[12px] text-muted-foreground font-sans mt-1">
            <span>{{ txn.type }}</span>
            <span>{{ txn.date }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing {{ resultCount }} of {{ totalTransactions }} transactions</span>
        <div class="flex items-center gap-1.5">
          <button @click="goPage(currentPage - 1)" :disabled="currentPage <= 1" class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground disabled:opacity-40">Prev</button>
          <template v-for="p in totalPages" :key="p">
            <button @click="goPage(p)" class="px-2.5 py-1 rounded-md text-[12px] font-sans" :class="p === currentPage ? 'bg-foreground text-white' : 'bg-white border border-border text-foreground'">{{ p }}</button>
          </template>
          <button @click="goPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-2.5 py-1 bg-primary rounded-md text-[12px] font-sans text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
    <!-- Transaction Detail Modal -->
    <OpsTransactionDetailModal v-model="showTransaction" />
  </div>
</template>
