<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const close = () => emit('update:modelValue', false)

const invoice = ref({
  id: 'INV-2026-0034',
  status: 'Paid',
  date: 'March 10, 2026',
  amount: '₦45,000',
  dueDate: 'March 10, 2026',
  paymentMethod: 'Bank Transfer',
  lineItems: [
    { description: 'Verification Credits (Starter)', qty: 5, unitPrice: '₦9,000', total: '₦45,000' },
  ],
  subtotal: '₦45,000',
  vat: '₦3,375',
  total: '₦48,375',
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Modal -->
        <div class="relative w-full mx-4 max-w-[520px] bg-white rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
            <div class="flex items-center gap-3">
              <h2 class="font-mono text-[16px] font-bold text-foreground">Invoice #{{ invoice.id }}</h2>
              <span class="inline-flex px-2.5 py-1 rounded-full bg-[#DFE6E1] text-[11px] font-semibold text-[#004D1A]">{{ invoice.status }}</span>
            </div>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E7E8E5] hover:bg-border transition-colors">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            <!-- Detail Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <span class="font-sans text-[12px] text-muted-foreground">Date</span>
                <span class="font-sans text-[13px] font-medium text-foreground">{{ invoice.date }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-sans text-[12px] text-muted-foreground">Due Date</span>
                <span class="font-sans text-[13px] font-medium text-foreground">{{ invoice.dueDate }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-sans text-[12px] text-muted-foreground">Amount</span>
                <span class="font-mono text-[13px] font-semibold text-foreground">{{ invoice.amount }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-sans text-[12px] text-muted-foreground">Payment Method</span>
                <span class="font-sans text-[13px] font-medium text-foreground">{{ invoice.paymentMethod }}</span>
              </div>
            </div>

            <!-- Line Items Table -->
            <div class="border border-border rounded-lg overflow-hidden">
              <!-- Table Header -->
              <div class="flex items-center bg-[#E7E8E5] px-4 py-2.5 border-b border-border">
                <span class="flex-1 font-sans text-[12px] font-semibold text-muted-foreground">Description</span>
                <span class="w-[50px] font-sans text-[12px] font-semibold text-muted-foreground">Qty</span>
                <span class="w-[90px] font-sans text-[12px] font-semibold text-muted-foreground">Unit Price</span>
                <span class="w-[80px] font-sans text-[12px] font-semibold text-muted-foreground text-right">Total</span>
              </div>
              <!-- Table Rows -->
              <div
                v-for="(item, i) in invoice.lineItems"
                :key="i"
                class="flex items-center px-4 py-2.5 border-b border-border last:border-0"
              >
                <span class="flex-1 font-sans text-[12px] text-foreground">{{ item.description }}</span>
                <span class="w-[50px] font-sans text-[12px] text-foreground">{{ item.qty }}</span>
                <span class="w-[90px] font-sans text-[12px] text-foreground">{{ item.unitPrice }}</span>
                <span class="w-[80px] font-sans text-[12px] font-medium text-foreground text-right">{{ item.total }}</span>
              </div>
            </div>

            <!-- Summary -->
            <div class="flex flex-col items-end gap-2">
              <div class="flex justify-between w-[220px]">
                <span class="font-sans text-[13px] text-muted-foreground">Subtotal</span>
                <span class="font-sans text-[13px] text-foreground">{{ invoice.subtotal }}</span>
              </div>
              <div class="flex justify-between w-[220px]">
                <span class="font-sans text-[13px] text-muted-foreground">VAT (7.5%)</span>
                <span class="font-sans text-[13px] text-foreground">{{ invoice.vat }}</span>
              </div>
              <div class="w-[220px] h-px bg-border" />
              <div class="flex justify-between w-[220px]">
                <span class="font-sans text-[14px] font-bold text-foreground">Total</span>
                <span class="font-mono text-[14px] font-bold text-foreground">{{ invoice.total }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-5 border-t border-border flex-shrink-0">
            <button class="flex items-center gap-2 px-5 h-10 border border-border rounded-lg text-[13px] font-sans font-medium text-foreground hover:bg-background transition-colors">
              <span class="material-symbols-rounded text-[16px]">download</span>
              Download PDF
            </button>
            <button @click="close" class="px-5 h-10 bg-foreground text-white rounded-lg text-[13px] font-sans font-medium hover:opacity-90 transition-opacity">
              Close
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
