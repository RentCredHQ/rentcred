<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'DASHBOARD', icon: 'dashboard', to: '/field-agent' },
  { label: 'SCHEDULE', icon: 'calendar_today', to: '/field-agent/schedule' },
  { label: 'REPORTS', icon: 'bar_chart', to: '/field-agent/reports' },
  { label: 'PROFILE', icon: 'person', to: '/field-agent/profile' },
]

function isActive(to: string) {
  if (to === '/field-agent') return route.path === '/field-agent'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <header class="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div class="flex items-center justify-between px-5 h-16">
        <div class="flex flex-col gap-0">
          <span class="font-sans text-[15px] font-semibold text-foreground">Hi, Agent</span>
          <span class="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">Field Agent</span>
        </div>
        <button class="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card">
          <span class="material-symbols-rounded text-[20px] text-muted-foreground">notifications</span>
        </button>
      </div>
    </header>

    <main class="flex-1 pt-16 overflow-y-auto">
      <div class="p-5 pb-28">
        <slot />
      </div>
    </main>

    <div class="fixed bottom-0 left-0 right-0 bg-background px-5 pb-5 pt-3 z-40">
      <div class="flex items-center rounded-full bg-card border border-border p-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex-1 flex flex-col items-center justify-center py-2 rounded-full font-mono text-[10px] font-semibold tracking-wide gap-1"
          :class="isActive(tab.to) ? 'bg-primary text-foreground' : 'text-muted-foreground'"
        >
          <span class="material-symbols-rounded text-[18px]">{{ tab.icon }}</span>
          {{ tab.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
