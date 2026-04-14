<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Payment History — RentCred' })

const { getPaymentStats, getTransactionHistory } = usePayments()

const loading = ref(true)

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Refunded', value: 'Refunded' },
]

const dateOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last Year', value: 'year' },
]

const kpis = ref([
  { label: 'Total Spent', value: '₦0', icon: 'payments' },
  { label: 'This Month', value: '₦0', icon: 'calendar_today' },
  { label: 'Transactions', value: '0', icon: 'receipt_long' },
])

function getTxStatusStyle(status: string) {
  if (status === 'refund' || status === 'refunded') return { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' }
  return { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' }
}

const rawTransactions = ref<any[]>([])

const transactions = computed(() =>
  rawTransactions.value.map((tx: any) => {
    const style = getTxStatusStyle(tx.status)
    const statusLabel = tx.status === 'refund' || tx.status === 'refunded' ? 'Refunded' : 'Completed'
    return {
      id: tx.id,
      desc: tx.description || tx.type || '',
      date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `₦${(tx.amount ?? 0).toLocaleString()}`,
      method: tx.method || 'Paystack',
      status: statusLabel,
      statusBg: style.bg,
      statusText: style.text,
    }
  })
)

const { searchQuery, activeFilter, filtered, resultCount } = useFilter({
  items: transactions,
  searchFields: ['id', 'desc'],
  statusField: 'status',
})

const selectedDate = ref('all')

onMounted(async () => {
  try {
    const [statsRes, historyRes] = await Promise.all([
      getPaymentStats(),
      getTransactionHistory(),
    ])

    const s = statsRes.data ?? statsRes
    kpis.value = [
      { label: 'Total Spent', value: `₦${(s.totalSpent ?? 0).toLocaleString()}`, icon: 'payments' },
      { label: 'This Month', value: `₦${(s.thisMonth ?? 0).toLocaleString()}`, icon: 'calendar_today' },
      { label: 'Transactions', value: String(s.totalTransactions ?? historyRes.data?.length ?? 0), icon: 'receipt_long' },
    ]

    rawTransactions.value = historyRes.data ?? []
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="flex flex-col gap-0.5">
      <h1 class="font-sans text-xl font-semibold text-foreground">Payment History</h1>
      <p class="font-sans text-[13px] text-muted-foreground">Track all your payment transactions</p>
    </div>

    <!-- Filters -->
    <UiFilterBar>
      <UiFilterTabs v-model="activeFilter" :tabs="statusTabs" />
      <UiFilterDropdown v-model="selectedDate" :options="dateOptions" icon="calendar_today" />
      <UiFilterSearch v-model="searchQuery" placeholder="Search..." />
    </UiFilterBar>

    <!-- KPI Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-sans text-[13px] text-muted-foreground">{{ kpi.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ kpi.icon }}</span>
        </div>
        <span class="font-mono text-2xl font-bold text-foreground">{{ kpi.value }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      <!-- Desktop -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-5 py-3 border-b border-border">
          <div class="w-[140px]"><span class="font-mono text-[12px] font-medium text-muted-foreground tracking-wider">Transaction ID</span></div>
          <div class="flex-1"><span class="font-sans text-[12px] font-medium text-muted-foreground">Description</span></div>
          <div class="w-[120px]"><span class="font-sans text-[12px] font-medium text-muted-foreground">Date</span></div>
          <div class="w-[100px]"><span class="font-sans text-[12px] font-medium text-muted-foreground">Amount</span></div>
          <div class="w-[120px]"><span class="font-sans text-[12px] font-medium text-muted-foreground">Method</span></div>
          <div class="w-[100px]"><span class="font-sans text-[12px] font-medium text-muted-foreground">Status</span></div>
        </div>
        <div v-for="tx in filtered" :key="tx.id" class="flex items-center px-5 py-3.5 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[140px]"><span class="font-mono text-[13px] text-muted-foreground">{{ tx.id }}</span></div>
          <div class="flex-1"><span class="font-sans text-sm text-foreground">{{ tx.desc }}</span></div>
          <div class="w-[120px]"><span class="font-sans text-[13px] text-muted-foreground">{{ tx.date }}</span></div>
          <div class="w-[100px]"><span class="font-mono text-sm font-medium text-foreground">{{ tx.amount }}</span></div>
          <div class="w-[120px]"><span class="font-sans text-[13px] text-muted-foreground">{{ tx.method }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium" :class="[tx.statusBg, tx.statusText]">{{ tx.status }}</span>
          </div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div v-for="tx in filtered" :key="tx.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1">
            <span class="font-sans text-sm font-medium text-foreground">{{ tx.desc }}</span>
            <span class="font-mono text-sm font-medium text-foreground">{{ tx.amount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-sans text-[12px] text-muted-foreground">{{ tx.date }} · {{ tx.method }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium" :class="[tx.statusBg, tx.statusText]">{{ tx.status }}</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing 1–{{ resultCount }} of {{ resultCount }} transactions</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Next</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
