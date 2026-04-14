<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Payment & Billing — RentCred' })

const { getPaymentStats, getTransactionHistory } = usePayments()

const kpis = ref<any[]>([])
const invoices = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [statsRes, historyRes] = await Promise.all([
      getPaymentStats(),
      getTransactionHistory(),
    ])
    if (statsRes) {
      const s = statsRes as any
      kpis.value = [
        { label: 'TOTAL SPENT', value: s.totalSpent ?? '—', sub: s.totalSpentPeriod ?? '', valueColor: 'text-foreground' },
        { label: 'PENDING INVOICES', value: s.pendingInvoices ?? '0', sub: s.pendingSub ?? '', valueColor: 'text-[#804200]' },
        { label: 'LAST PAYMENT', value: s.lastPaymentAmount ?? '—', sub: s.lastPaymentDesc ?? '', valueColor: 'text-[#004D1A]' },
        { label: 'PAYMENT METHOD', value: s.paymentMethod ?? '—', sub: s.paymentMethodSub ?? '', valueColor: 'text-foreground', smallValue: true },
      ]
    }
    if (historyRes) {
      invoices.value = (Array.isArray(historyRes) ? historyRes : []).map((inv: any) => ({
        ...inv,
        statusBg: inv.status === 'Paid' ? 'bg-[#DFE6E1]' : 'bg-[#E9E3D8]',
        statusText: inv.status === 'Paid' ? 'text-[#004D1A]' : 'text-[#804200]',
      }))
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
      <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Payment & Billing</h1>
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

        <div v-for="inv in invoices" :key="inv.id" class="flex items-center px-6 py-3 border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
          <div class="w-[160px]"><span class="font-mono text-[13px] text-foreground font-medium">{{ inv.id }}</span></div>
          <div class="w-[140px]"><span class="font-sans text-[13px] text-muted-foreground">{{ inv.date }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-foreground">{{ inv.desc }}</span></div>
          <div class="w-[120px]"><span class="font-mono text-sm font-medium text-foreground">{{ inv.amount }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium" :class="[inv.statusBg, inv.statusText]">{{ inv.status }}</span>
          </div>
          <div class="w-[80px]">
            <span class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">download</span>
          </div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <div v-for="inv in invoices" :key="inv.id" class="px-4 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1">
            <span class="font-sans text-sm font-medium text-foreground">{{ inv.desc }}</span>
            <span class="font-mono text-sm font-medium text-foreground">{{ inv.amount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-sans text-[12px] text-muted-foreground">{{ inv.date }} · {{ inv.id }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium" :class="[inv.statusBg, inv.statusText]">{{ inv.status }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-border">
        <span class="font-sans text-[12px] text-muted-foreground">Showing 1–5 of 5 invoices</span>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Prev</button>
          <button class="px-2.5 py-1 bg-foreground rounded-md text-[12px] font-sans text-white">1</button>
          <button class="px-2.5 py-1 bg-white border border-border rounded-md text-[12px] font-sans text-foreground">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
