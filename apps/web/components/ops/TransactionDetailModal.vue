<script setup lang="ts">
const show = defineModel<boolean>({ default: false })
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
              <h3 class="font-mono text-base font-semibold text-foreground">TXN-00451</h3>
              <span class="font-sans text-[12px] text-muted-foreground">Mar 14, 2025 · 2:30 PM</span>
            </div>
            <button @click="show = false" class="text-muted-foreground hover:text-foreground">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <div class="flex flex-col gap-5 p-6">
            <!-- Amount & Status -->
            <div class="flex items-center justify-between">
              <span class="font-mono text-2xl font-bold text-foreground">₦25,000</span>
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DFE6E1] text-[#004D1A]">Processed</span>
            </div>

            <!-- Details -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Type</span>
                <span class="font-sans text-[13px] text-foreground">Verification Fee</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Case ID</span>
                <span class="font-mono text-[13px] text-foreground">RC-1041</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Tenant</span>
                <span class="font-sans text-[13px] text-foreground">Amaechi Oguntayo</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Agent</span>
                <span class="font-sans text-[13px] text-foreground">Premier Realty</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Payment Method</span>
                <span class="font-sans text-[13px] text-foreground">Bank Transfer</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-border">
                <span class="font-sans text-[13px] text-muted-foreground">Reference</span>
                <span class="font-mono text-[12px] text-foreground">PAY-2025-0314-0451</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="font-sans text-[13px] text-muted-foreground">Commission</span>
                <span class="font-mono text-[13px] font-semibold text-primary">₦5,000</span>
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
