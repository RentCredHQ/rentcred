<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}

const notifications = ref([
  { id: 1, title: 'New KYB application', desc: 'Nwosu Properties Ltd submitted a KYB application for review.', time: '5 minutes ago', read: false, dot: 'bg-primary' },
  { id: 2, title: 'Case escalated', desc: 'Case RC-1037 has been escalated due to overdue field visit.', time: '30 minutes ago', read: false, dot: 'bg-[#8C1C00]' },
  { id: 3, title: 'Report submitted', desc: 'Chidi Nwosu submitted verification report RPT-0089 for review.', time: '1 hour ago', read: false, dot: 'bg-[#004D1A]' },
  { id: 4, title: 'Agent suspended', desc: 'Tunde Bakare has been automatically suspended after 3 failed checks.', time: '3 hours ago', read: true, dot: 'bg-[#804200]' },
  { id: 5, title: 'Payment processed', desc: 'Commission payment of ₦45,000 to Premier Realty completed.', time: '5 hours ago', read: true, dot: 'bg-[#004D1A]' },
])

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}
</script>

<template>
  <Transition name="dropdown">
    <div v-if="modelValue" class="absolute right-0 top-full mt-2 w-[360px] bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
      <div class="fixed inset-0 z-[-1]" @click="close" />

      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <span class="font-mono text-sm font-semibold text-foreground">Notifications</span>
        <button @click="markAllRead" class="text-[12px] font-sans text-primary hover:underline">Mark all read</button>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="flex gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors"
          :class="n.read ? 'hover:bg-surface/30' : 'bg-[#FF84000A] hover:bg-[#FF840012]'"
        >
          <div class="flex-shrink-0 mt-1.5">
            <div class="w-2 h-2 rounded-full" :class="n.dot" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[13px] font-sans block" :class="n.read ? 'text-foreground' : 'text-foreground font-semibold'">{{ n.title }}</span>
            <span class="text-[12px] font-sans text-muted-foreground block mt-0.5 line-clamp-2">{{ n.desc }}</span>
            <span class="text-[11px] font-sans text-muted-foreground mt-1 block">{{ n.time }}</span>
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
