<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const user = computed(() => {
  if (!authStore.user) return null
  const name = authStore.user.name || 'User'
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const firstName = name.split(' ')[0]
  return { initials, name, firstName, email: authStore.user.email }
})

const profileItems = [
  { label: 'Dashboard', icon: 'home', to: '/tenant' },
  { label: 'Complete Profile', icon: 'person', to: '/tenant/profile/1' },
]

const verificationItems = [
  { label: 'Verification Status', icon: 'verified', to: '/tenant/verification' },
  { label: 'Reports', icon: 'description', to: '/tenant/reports' },
  { label: 'Reviews', icon: 'star', to: '/tenant/reviews' },
]

const supportItems = [
  { label: 'Disputes', icon: 'gavel', to: '/tenant/disputes' },
]

function isActive(to: string) {
  if (to === '/tenant') return route.path === '/tenant'
  return route.path.startsWith(to)
}

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex sticky top-0 h-screen w-[260px] bg-[#E7E8E5] flex-col border-r border-border flex-shrink-0">
      <div class="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <UiRentCredLogo :size="28" variant="light" :show-text="true" :horizontal="true" />
      </div>

      <nav class="flex-1 flex flex-col gap-6 px-3 py-4 overflow-y-auto">
        <div class="flex flex-col gap-0.5">
          <span class="px-3 py-2 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">My Profile</span>
          <NuxtLink
            v-for="item in profileItems" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors"
            :class="isActive(item.to) ? 'bg-[#CBCCC9] text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-[#CBCCC9]/50'"
          >
            <span class="material-symbols-rounded text-[20px]">{{ item.icon }}</span>
            {{ item.label }}
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-0.5">
          <span class="px-3 py-2 pt-4 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Verification</span>
          <NuxtLink
            v-for="item in verificationItems" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors"
            :class="isActive(item.to) ? 'bg-[#CBCCC9] text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-[#CBCCC9]/50'"
          >
            <span class="material-symbols-rounded text-[20px]">{{ item.icon }}</span>
            {{ item.label }}
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-0.5">
          <span class="px-3 py-2 pt-4 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Support</span>
          <NuxtLink
            v-for="item in supportItems" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors"
            :class="isActive(item.to) ? 'bg-[#CBCCC9] text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-[#CBCCC9]/50'"
          >
            <span class="material-symbols-rounded text-[20px]">{{ item.icon }}</span>
            {{ item.label }}
          </NuxtLink>
        </div>
      </nav>

      <div class="flex items-center gap-3 px-6 py-4 border-t border-border">
        <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <span class="font-mono text-[13px] font-semibold text-foreground">{{ user?.initials || 'U' }}</span>
        </div>
        <div class="flex flex-col gap-px">
          <span class="text-[13px] font-medium text-foreground font-sans">{{ user?.name || 'User' }}</span>
          <span class="text-[11px] text-muted-foreground font-sans truncate">{{ user?.email || 'Loading...' }}</span>
        </div>
      </div>
    </aside>

    <!-- Mobile Top Nav -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div class="flex items-center justify-between px-5 h-14">
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-foreground">
          <span class="material-symbols-rounded text-[24px]">menu</span>
        </button>
        <span class="font-mono text-lg font-bold text-primary">RentCred</span>
        <NuxtLink to="/tenant/verification" class="text-foreground">
          <span class="material-symbols-rounded text-[24px]">notifications</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile Slide-out Menu -->
    <Teleport to="body">
      <Transition name="dashfade">
        <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 bg-black/50 z-50" @click="mobileMenuOpen = false" />
      </Transition>
      <Transition name="dashslide">
        <aside v-if="mobileMenuOpen" class="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#E7E8E5] z-50 flex flex-col overflow-y-auto">
          <div class="flex items-center justify-between px-5 py-5 border-b border-border">
            <UiRentCredLogo :size="24" variant="light" :show-text="true" :horizontal="true" />
            <button @click="mobileMenuOpen = false" class="text-muted-foreground">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <nav class="flex-1 flex flex-col gap-4 px-3 py-4">
            <div class="flex flex-col gap-0.5">
              <span class="px-3 py-2 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">My Profile</span>
              <NuxtLink v-for="item in profileItems" :key="item.to" :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors"
                :class="isActive(item.to) ? 'bg-[#CBCCC9] text-foreground font-semibold' : 'text-muted-foreground'"
              >
                <span class="material-symbols-rounded text-[20px]">{{ item.icon }}</span>
                {{ item.label }}
              </NuxtLink>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="px-3 py-2 pt-4 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Verification</span>
              <NuxtLink v-for="item in verificationItems" :key="item.to" :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors"
                :class="isActive(item.to) ? 'bg-[#CBCCC9] text-foreground font-semibold' : 'text-muted-foreground'"
              >
                <span class="material-symbols-rounded text-[20px]">{{ item.icon }}</span>
                {{ item.label }}
              </NuxtLink>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="px-3 py-2 pt-4 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Support</span>
              <NuxtLink v-for="item in supportItems" :key="item.to" :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors"
                :class="isActive(item.to) ? 'bg-[#CBCCC9] text-foreground font-semibold' : 'text-muted-foreground'"
              >
                <span class="material-symbols-rounded text-[20px]">{{ item.icon }}</span>
                {{ item.label }}
              </NuxtLink>
            </div>
          </nav>

          <div class="flex items-center gap-3 px-5 py-4 border-t border-border">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span class="font-mono text-[13px] font-semibold text-foreground">{{ user?.initials || 'U' }}</span>
            </div>
            <div class="flex flex-col gap-px">
              <span class="text-[13px] font-medium text-foreground font-sans">{{ user?.name || 'User' }}</span>
              <span class="text-[11px] text-muted-foreground font-sans truncate">{{ user?.email || 'Loading...' }}</span>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border bg-background">
        <div class="flex flex-col gap-0.5">
          <h1 class="font-sans text-xl font-semibold text-foreground">Welcome back, {{ user?.firstName || 'User' }}</h1>
          <span class="font-sans text-[13px] text-muted-foreground">{{ user?.email || 'Loading...' }} &bull; Tenant Portal</span>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/tenant/profile/1" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">
            <span class="material-symbols-rounded text-[18px]">edit</span>
            Complete Profile
          </NuxtLink>
          <button @click="authStore.logout()" class="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-surface transition-colors">
            <span class="material-symbols-rounded text-[20px] text-muted-foreground">logout</span>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="p-5 lg:p-8 pt-20 lg:pt-8 pb-28 lg:pb-8">
          <slot />
        </div>
      </main>

      <!-- Mobile Bottom Tab Bar -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-background px-5 pb-5 pt-3 z-40">
        <div class="flex items-center rounded-full bg-white border border-border p-1">
          <NuxtLink to="/tenant" class="flex-1 flex flex-col items-center justify-center py-2 rounded-full text-[10px] font-semibold tracking-wide font-sans gap-1"
            :class="route.path === '/tenant' ? 'bg-primary text-foreground' : 'text-muted-foreground'">
            <span class="material-symbols-rounded text-[18px]">home</span>
            HOME
          </NuxtLink>
          <NuxtLink to="/tenant/profile/1" class="flex-1 flex flex-col items-center justify-center py-2 rounded-full text-[10px] font-semibold tracking-wide font-sans gap-1"
            :class="route.path.startsWith('/tenant/profile') ? 'bg-primary text-foreground' : 'text-muted-foreground'">
            <span class="material-symbols-rounded text-[18px]">person</span>
            PROFILE
          </NuxtLink>
          <NuxtLink to="/tenant/verification" class="flex-1 flex flex-col items-center justify-center py-2 rounded-full text-[10px] font-semibold tracking-wide font-sans gap-1"
            :class="route.path.startsWith('/tenant/verification') ? 'bg-primary text-foreground' : 'text-muted-foreground'">
            <span class="material-symbols-rounded text-[18px]">verified</span>
            STATUS
          </NuxtLink>
          <NuxtLink to="/tenant/reports" class="flex-1 flex flex-col items-center justify-center py-2 rounded-full text-[10px] font-semibold tracking-wide font-sans gap-1"
            :class="route.path.startsWith('/tenant/reports') ? 'bg-primary text-foreground' : 'text-muted-foreground'">
            <span class="material-symbols-rounded text-[18px]">description</span>
            REPORTS
          </NuxtLink>
          <NuxtLink to="/tenant/disputes" class="flex-1 flex flex-col items-center justify-center py-2 rounded-full text-[10px] font-semibold tracking-wide font-sans gap-1"
            :class="route.path.startsWith('/tenant/disputes') ? 'bg-primary text-foreground' : 'text-muted-foreground'">
            <span class="material-symbols-rounded text-[18px]">more_horiz</span>
            MORE
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.dashfade-enter-active,
.dashfade-leave-active {
  transition: opacity 0.2s ease;
}
.dashfade-enter-from,
.dashfade-leave-to {
  opacity: 0;
}
.dashslide-enter-active,
.dashslide-leave-active {
  transition: transform 0.3s ease;
}
.dashslide-enter-from,
.dashslide-leave-to {
  transform: translateX(-100%);
}
</style>
