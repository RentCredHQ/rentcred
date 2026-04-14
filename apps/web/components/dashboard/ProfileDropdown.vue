<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const authStore = useAuthStore()

const close = () => emit('update:modelValue', false)

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
  { label: 'Account Settings', icon: 'person', to: '/settings' },
  { label: 'Notifications', icon: 'notifications', to: '/settings/notifications' },
  { label: 'Security & Privacy', icon: 'security', to: '/settings' },
  { label: 'Help & Support', icon: 'help', to: '/contact' },
  { label: 'About RentCred', icon: 'info', to: '/about' },
]

function handleSignOut() {
  close()
  authStore.logout()
}
</script>

<template>
  <Transition name="dropdown">
    <div v-if="modelValue" class="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl border border-border shadow-xl flex flex-col overflow-hidden z-50">
      <!-- Backdrop (click outside to close) -->
      <div class="fixed inset-0 z-[-1]" @click="close" />

      <!-- User Info -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span class="font-mono text-[14px] font-bold text-foreground">{{ user?.initials || 'U' }}</span>
        </div>
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <span class="font-mono text-[14px] font-bold text-foreground">{{ user?.name || 'User' }}</span>
          <span class="font-sans text-[12px] text-muted-foreground truncate">{{ user?.email || 'Loading...' }}</span>
          <span class="inline-flex w-fit px-2 py-0.5 rounded bg-[#E7E8E5] text-[11px] font-semibold text-foreground mt-0.5">{{ user?.role || 'User' }}</span>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="flex flex-col py-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors"
          @click="close"
        >
          <span class="material-symbols-rounded text-[20px] text-muted-foreground">{{ item.icon }}</span>
          <span class="font-sans text-[14px] font-medium text-foreground flex-1">{{ item.label }}</span>
          <span class="material-symbols-rounded text-[18px] text-muted-foreground">chevron_right</span>
        </NuxtLink>
      </div>

      <!-- Logout -->
      <div class="border-t border-border">
        <button class="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#FDECEC] transition-colors" @click="handleSignOut">
          <span class="material-symbols-rounded text-[20px] text-[#991B1B]">logout</span>
          <span class="font-mono text-[14px] font-semibold text-[#991B1B]">Sign Out</span>
        </button>
      </div>

      <!-- Version -->
      <div class="px-4 py-2 border-t border-border">
        <span class="font-sans text-[11px] text-muted-foreground/50">RentCred v1.0.0</span>
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
