<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
const close = () => emit('update:modelValue', false)

const { getBundles, purchaseBundle } = usePayments()

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: string
  priceNum: number
  unit: string
  features: string[]
  popular?: boolean
}

const packages = ref<CreditPackage[]>([])
const loadingBundles = ref(true)
const purchasing = ref(false)

const selectedPkg = ref(0)
const paymentMethod = ref<'bank' | 'card'>('bank')

const total = computed(() => packages.value[selectedPkg.value]?.price ?? '₦0')

watch(() => props.modelValue, async (open: boolean) => {
  if (open && packages.value.length === 0) {
    loadingBundles.value = true
    try {
      const res = await getBundles()
      packages.value = (res.data ?? []).map((b: any, i: number) => ({
        id: b.id,
        name: b.name,
        credits: b.credits,
        price: `₦${(b.priceNgn ?? b.price ?? 0).toLocaleString()}`,
        priceNum: b.priceNgn ?? b.price ?? 0,
        unit: `₦${Math.round((b.priceNgn ?? b.price ?? 0) / b.credits).toLocaleString()}/credit`,
        features: b.features || ['Verification credits'],
        popular: i === 1,
      }))
      if (packages.value.length > 1) selectedPkg.value = 1
    } catch { /* empty */ }
    finally { loadingBundles.value = false }
  }
})

async function handlePurchase() {
  const pkg = packages.value[selectedPkg.value]
  if (!pkg) return
  purchasing.value = true
  try {
    await purchaseBundle(pkg.id)
    close()
  } catch { /* empty */ }
  finally { purchasing.value = false }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative w-full mx-4 max-w-[560px] bg-white rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 class="font-mono text-base font-bold text-foreground">Purchase Verification Credits</h2>
            <button @click="close" class="w-8 h-8 rounded-lg bg-[#E7E8E5] flex items-center justify-center hover:bg-border transition-colors">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex flex-col gap-5 p-6">
            <!-- Loading -->
            <div v-if="loadingBundles" class="flex items-center justify-center py-10">
              <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
            </div>

            <!-- Credit packages -->
            <div v-else class="flex gap-3">
              <button
                v-for="(pkg, i) in packages"
                :key="pkg.name"
                @click="selectedPkg = i"
                class="flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border transition-colors"
                :class="selectedPkg === i
                  ? 'bg-[#FF84000A] border-primary border-2'
                  : 'border-border hover:border-muted-foreground'"
              >
                <span v-if="pkg.popular" class="px-2.5 py-1 rounded-full bg-primary text-white font-sans text-[10px] font-semibold">Most Popular</span>
                <span class="font-mono text-sm font-semibold text-foreground">{{ pkg.name }}</span>
                <span class="font-sans text-[13px] text-muted-foreground">{{ pkg.credits }} credits</span>
                <span class="font-mono text-[22px] font-bold text-foreground">{{ pkg.price }}</span>
                <span class="font-sans text-[11px] text-muted-foreground">{{ pkg.unit }}</span>
                <div class="flex flex-col gap-1.5 w-full pt-2">
                  <span v-for="f in pkg.features" :key="f" class="font-sans text-[11px] text-muted-foreground">✓ {{ f }}</span>
                </div>
                <div
                  class="w-full h-9 flex items-center justify-center rounded-lg font-sans text-[13px] font-medium mt-auto"
                  :class="selectedPkg === i
                    ? 'bg-primary text-white'
                    : 'border border-border text-foreground'"
                >
                  {{ selectedPkg === i ? 'Selected' : 'Select' }}
                </div>
              </button>
            </div>

            <div class="h-px bg-border" />

            <!-- Payment method -->
            <div class="flex flex-col gap-2.5">
              <span class="font-sans text-sm font-semibold text-foreground">Payment Method</span>
              <div class="flex gap-3">
                <button
                  @click="paymentMethod = 'bank'"
                  class="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg font-sans text-[13px] font-medium transition-colors"
                  :class="paymentMethod === 'bank'
                    ? 'bg-[#FF84000A] border-2 border-primary text-foreground'
                    : 'border border-border text-foreground hover:bg-background'"
                >
                  <span class="material-symbols-rounded text-[18px]">account_balance</span>
                  Bank Transfer
                </button>
                <button
                  @click="paymentMethod = 'card'"
                  class="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg font-sans text-[13px] font-medium transition-colors"
                  :class="paymentMethod === 'card'
                    ? 'bg-[#FF84000A] border-2 border-primary text-foreground'
                    : 'border border-border text-foreground hover:bg-background'"
                >
                  <span class="material-symbols-rounded text-[18px]">credit_card</span>
                  Card Payment
                </button>
              </div>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between py-3">
              <span class="font-sans text-sm font-semibold text-foreground">Total</span>
              <span class="font-mono text-xl font-bold text-foreground">{{ total }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-border">
            <button
              @click="handlePurchase"
              :disabled="purchasing || packages.length === 0"
              class="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-sans text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <span v-if="purchasing" class="material-symbols-rounded text-[20px] animate-spin">progress_activity</span>
              <span v-else class="material-symbols-rounded text-[20px]">payments</span>
              {{ purchasing ? 'Processing...' : 'Proceed to Payment' }}
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
