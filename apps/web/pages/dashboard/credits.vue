<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Bundle Credits — RentCred' })

const { getDashboardStats } = useAgents()
const { getBundles, getTransactionHistory } = usePayments()

const loading = ref(true)

const kpis = ref({
  remaining: { value: 0, total: 0 },
  used: 0,
  activePlan: '',
  purchased: '',
})

const bundles = ref<any[]>([])

const history = ref<any[]>([])

onMounted(async () => {
  try {
    const [statsRes, bundlesRes, historyRes] = await Promise.all([
      getDashboardStats(),
      getBundles(),
      getTransactionHistory({ limit: 5 }),
    ])

    const d = statsRes.data
    const creditBalance = d.creditBalance ?? 0
    const totalSubmissions = d.totalSubmissions ?? 0
    kpis.value = {
      remaining: { value: creditBalance, total: creditBalance + totalSubmissions },
      used: totalSubmissions,
      activePlan: 'Current Plan',
      purchased: '',
    }

    bundles.value = (bundlesRes.data ?? []).map((b: any, i: number) => ({
      name: b.name,
      credits: b.credits,
      price: b.priceNgn ?? b.price ?? 0,
      perCheck: `₦${Math.round((b.priceNgn ?? b.price ?? 0) / b.credits).toLocaleString()}/check`,
      featured: i === 1,
      badge: i === 1 ? 'Best Value' : undefined,
    }))

    history.value = (historyRes.data ?? []).map((tx: any) => ({
      bundle: tx.description || tx.type || '',
      date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `₦${(tx.amount ?? 0).toLocaleString()}`,
      method: tx.method || 'Paystack',
      status: tx.status === 'completed' ? 'Completed' : tx.status || 'Completed',
    }))
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="font-mono text-2xl font-bold text-foreground">Bundle Credits</h1>
      <button class="flex items-center gap-2 px-6 py-2.5 bg-primary text-foreground font-sans text-sm font-semibold hover:opacity-90 transition-opacity">
        <span class="material-symbols-rounded text-[18px]">add</span>
        Buy Bundle
      </button>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-sans text-[13px] text-muted-foreground">Credits Remaining</span>
        <div class="flex items-end gap-2">
          <span class="font-mono text-4xl font-bold text-foreground leading-none">{{ kpis.remaining.value }}</span>
          <span class="font-sans text-[13px] text-muted-foreground pb-1">of {{ kpis.remaining.total }}</span>
        </div>
        <div class="w-full h-2 bg-background rounded-full mt-1">
          <div class="h-2 bg-primary rounded-full" :style="{ width: `${(kpis.remaining.value / kpis.remaining.total) * 100}%` }" />
        </div>
      </div>
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-sans text-[13px] text-muted-foreground">Credits Used</span>
        <span class="font-mono text-4xl font-bold text-foreground leading-none">{{ kpis.used }}</span>
        <span class="inline-block w-fit px-2.5 py-1 rounded-full bg-[#DFDFE6] text-[#000066] text-[11px] font-medium mt-1">This billing cycle</span>
      </div>
      <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-2">
        <span class="font-sans text-[13px] text-muted-foreground">Active Bundle</span>
        <span class="font-mono text-2xl font-bold text-foreground">{{ kpis.activePlan }}</span>
        <span class="font-sans text-[13px] text-muted-foreground">Purchased: {{ kpis.purchased }}</span>
        <span class="inline-block w-fit px-2.5 py-1 rounded-full bg-[#DFE6E1] text-[#004D1A] text-[11px] font-medium">Active</span>
      </div>
    </div>

    <!-- Available Bundles -->
    <div class="flex flex-col gap-4">
      <h2 class="font-mono text-lg font-semibold text-foreground">Available Bundles</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          v-for="bundle in bundles"
          :key="bundle.name"
          class="bg-white rounded-xl p-6 flex flex-col gap-4"
          :class="bundle.featured ? 'border-2 border-primary' : 'border border-border'"
        >
          <div v-if="bundle.featured" class="flex">
            <span class="px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-mono font-semibold rounded-full">{{ bundle.badge }}</span>
          </div>
          <h3 class="font-mono text-lg font-semibold text-foreground">{{ bundle.name }}</h3>
          <span class="font-sans text-[13px] text-muted-foreground">{{ bundle.credits }} verification credits</span>
          <div class="flex items-baseline gap-1">
            <span class="font-mono text-3xl font-bold text-foreground">₦{{ bundle.price.toLocaleString() }}</span>
          </div>
          <span class="font-sans text-[12px] text-muted-foreground">{{ bundle.perCheck }}</span>
          <button
            class="w-full py-3 rounded text-sm font-sans font-semibold text-center transition-all mt-auto"
            :class="bundle.featured ? 'bg-primary text-foreground hover:opacity-90' : 'border border-border text-foreground hover:bg-surface'"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>

    <!-- Purchase History -->
    <div class="bg-white border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 class="font-mono text-base font-semibold text-foreground">Purchase History</h2>
        <span class="px-2.5 py-1 rounded-full bg-background font-sans text-[12px] text-muted-foreground">{{ history.length }} transactions</span>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block">
        <div class="flex bg-background px-6 py-2.5 border-b border-border">
          <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Bundle</span></div>
          <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Date</span></div>
          <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Amount</span></div>
          <div class="flex-1"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Payment</span></div>
          <div class="w-[100px]"><span class="font-mono text-[12px] font-semibold text-muted-foreground tracking-wider">Status</span></div>
        </div>
        <div v-for="tx in history" :key="tx.date" class="flex items-center px-6 py-3.5 border-b border-border last:border-0">
          <div class="flex-1"><span class="font-sans text-sm text-foreground">{{ tx.bundle }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-muted-foreground">{{ tx.date }}</span></div>
          <div class="flex-1"><span class="font-mono text-sm text-foreground">{{ tx.amount }}</span></div>
          <div class="flex-1"><span class="font-sans text-[13px] text-muted-foreground">{{ tx.method }}</span></div>
          <div class="w-[100px]">
            <span class="inline-flex px-2.5 py-1 rounded-full bg-[#DFE6E1] text-[#004D1A] text-[11px] font-medium">{{ tx.status }}</span>
          </div>
        </div>
      </div>

      <!-- Mobile List -->
      <div class="lg:hidden">
        <div v-for="tx in history" :key="tx.date" class="px-5 py-3.5 border-b border-border last:border-0">
          <div class="flex items-center justify-between mb-1">
            <span class="font-sans text-sm font-medium text-foreground">{{ tx.bundle }}</span>
            <span class="font-mono text-sm text-foreground">{{ tx.amount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-sans text-[12px] text-muted-foreground">{{ tx.date }} · {{ tx.method }}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full bg-[#DFE6E1] text-[#004D1A] text-[10px] font-medium">{{ tx.status }}</span>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
