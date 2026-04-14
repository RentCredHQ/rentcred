<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const authStore = useAuthStore()

function close() {
  emit('update:modelValue', false)
}

const user = computed(() => {
  if (!authStore.user) return null
  const name = authStore.user.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return {
    initials,
    name,
    email: authStore.user.email,
    role: authStore.user.role.charAt(0).toUpperCase() + authStore.user.role.slice(1),
  }
})

const menuItems = [
  { label: 'Account Settings', icon: 'settings', to: '/settings' },
  { label: 'Security & Privacy', icon: 'shield', to: '/settings' },
  { label: 'Help & Support', icon: 'help', to: '/settings' },
]

function handleSignOut() {
  close()
  authStore.logout()
}
</script>

<template>
  <Transition name="dropdown">
    <div v-if="modelValue" class="absolute right-0 top-full mt-2 w-[280px] bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
      <div class="fixed inset-0 z-[-1]" @click="close" />

      <!-- User Info -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span class="font-mono text-[13px] font-semibold text-white">{{ user?.initials || 'U' }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-[14px] font-sans font-semibold text-foreground block">{{ user?.name || 'User' }}</span>
          <span class="text-[12px] font-sans text-muted-foreground block truncate">{{ user?.email || 'Loading...' }}</span>
          <span class="inline-flex mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono font-semibold rounded-full">{{ user?.role || 'User' }}</span>
        </div>
      </div>

      <!-- Menu -->
      <div class="py-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          @click="close"
          class="flex items-center justify-between px-4 py-2.5 hover:bg-surface/50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-rounded text-[18px] text-muted-foreground">{{ item.icon }}</span>
            <span class="text-[13px] font-sans text-foreground">{{ item.label }}</span>
          </div>
          <span class="material-symbols-rounded text-[16px] text-muted-foreground">chevron_right</span>
        </NuxtLink>
      </div>

      <!-- Sign Out -->
      <div class="border-t border-border py-1">
        <button @click="handleSignOut" class="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#FDECEC] transition-colors">
          <span class="material-symbols-rounded text-[18px] text-[#8C1C00]">logout</span>
          <span class="text-[13px] font-sans text-[#8C1C00]">Sign Out</span>
        </button>
      </div>

      <div class="px-4 py-2 border-t border-border">
        <span class="text-[10px] font-mono text-muted-foreground">RentCred v1.0.0 · Admin Panel</span>
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
