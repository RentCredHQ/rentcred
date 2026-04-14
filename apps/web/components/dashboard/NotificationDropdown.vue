<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
const close = () => emit('update:modelValue', false)

const notifications = ref([
  { id: 1, title: 'Report ready', desc: 'Verification report for Adebayo Ogunlesi is now available to view.', time: '2 minutes ago', read: false, dot: 'bg-primary' },
  { id: 2, title: 'Tenant consent received', desc: 'Chioma Eze has completed their consent form for RC-2026-00389.', time: '15 minutes ago', read: false, dot: 'bg-[#004D1A]' },
  { id: 3, title: 'Verification in progress', desc: 'Case RC-2026-00412 verification has started.', time: '1 hour ago', read: true, dot: 'bg-[#1A56DB]' },
  { id: 4, title: 'Payment received', desc: '₦45,000 received for 5 verification credits.', time: '3 hours ago', read: true, dot: 'bg-[#004D1A]' },
  { id: 5, title: 'System maintenance scheduled', desc: 'Scheduled maintenance on March 20, 2:00 AM - 4:00 AM WAT.', time: 'Yesterday', read: true, dot: 'bg-muted-foreground' },
])

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}
</script>

<template>
  <Transition name="dropdown">
    <div v-if="modelValue" class="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl border border-border shadow-xl flex flex-col overflow-hidden z-50">
      <div class="fixed inset-0 z-[-1]" @click="close" />

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-border">
        <span class="font-mono text-[15px] font-semibold text-foreground">Notifications</span>
        <button @click="markAllRead" class="font-sans text-xs font-medium text-primary hover:underline">Mark all read</button>
      </div>

      <!-- List -->
      <div class="flex flex-col max-h-[400px] overflow-y-auto">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-background transition-colors cursor-pointer"
          :class="!n.read ? 'bg-[#FF84000A]' : ''"
        >
          <div class="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" :class="n.dot" />
          <div class="flex flex-col gap-1 flex-1 min-w-0">
            <span class="font-sans text-[13px] text-foreground" :class="n.read ? 'font-normal' : 'font-semibold'">{{ n.title }}</span>
            <span class="font-sans text-xs text-muted-foreground leading-snug">{{ n.desc }}</span>
            <span class="font-sans text-[11px] text-muted-foreground/60 mt-0.5">{{ n.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
