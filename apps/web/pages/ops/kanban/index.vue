<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useSeoMeta({ title: 'Kanban Board — RentCred Ops' })

const columns = ref([
  {
    title: 'Pending Assignment',
    color: 'bg-[#E9E3D8]',
    textColor: 'text-[#804200]',
    cards: [
      { id: 'RC-1042', tenant: 'Ngozi Udom', agent: 'Lagos Homes', priority: 'High', priorityBg: 'bg-[#E5DCDA]', priorityText: 'text-[#8C1C00]', updated: '30 min ago' },
      { id: 'RC-1043', tenant: 'Segun Adeniyi', agent: 'Premier Realty', priority: 'Medium', priorityBg: 'bg-[#E9E3D8]', priorityText: 'text-[#804200]', updated: '2 hours ago' },
    ],
  },
  {
    title: 'In Progress',
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    cards: [
      { id: 'RC-1041', tenant: 'Amaechi Oguntayo', agent: 'Premier Realty', priority: 'High', priorityBg: 'bg-[#E5DCDA]', priorityText: 'text-[#8C1C00]', updated: '2 hours ago', assignee: 'Chidi Nwosu' },
      { id: 'RC-1040', tenant: 'Obiorah Eze', agent: 'Lagos Homes', priority: 'Medium', priorityBg: 'bg-[#E9E3D8]', priorityText: 'text-[#804200]', updated: '4 hours ago', assignee: 'Funke Kadiri' },
      { id: 'RC-1038', tenant: 'Fatima Bello', agent: 'Abuja Lettings', priority: 'Medium', priorityBg: 'bg-[#E9E3D8]', priorityText: 'text-[#804200]', updated: '6 hours ago', assignee: 'Amara Okafor' },
    ],
  },
  {
    title: 'Field Visit',
    color: 'bg-[#E9E3D8]',
    textColor: 'text-[#804200]',
    cards: [
      { id: 'RC-1036', tenant: 'Chidera Ibe', agent: 'PHC Properties', priority: 'Low', priorityBg: 'bg-[#DFE6E1]', priorityText: 'text-[#004D1A]', updated: '1 day ago', assignee: 'Bola Adewale' },
    ],
  },
  {
    title: 'Pending Review',
    color: 'bg-[#E9E3D8]',
    textColor: 'text-[#804200]',
    cards: [
      { id: 'RC-1039', tenant: 'Nkechi Nwokey', agent: 'Premier Realty', priority: 'Low', priorityBg: 'bg-[#DFE6E1]', priorityText: 'text-[#004D1A]', updated: '1 day ago', assignee: 'Bola Adewale' },
      { id: 'RC-1037', tenant: 'Tunde Bakare', agent: 'PHC Properties', priority: 'High', priorityBg: 'bg-[#E5DCDA]', priorityText: 'text-[#8C1C00]', updated: '3 days ago', assignee: 'Yemi Ogundimu' },
    ],
  },
  {
    title: 'Completed',
    color: 'bg-[#DFE6E1]',
    textColor: 'text-[#004D1A]',
    cards: [
      { id: 'RC-1035', tenant: 'Emeka Nwachukwu', agent: 'Lagos Homes', priority: 'Medium', priorityBg: 'bg-[#E9E3D8]', priorityText: 'text-[#804200]', updated: '2 days ago', assignee: 'Chidi Nwosu' },
    ],
  },
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-mono text-xl font-bold text-foreground">Kanban Board</h1>
        <span class="font-sans text-sm text-muted-foreground">Visual case pipeline overview</span>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/ops/cases" class="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
          <span class="material-symbols-rounded text-[16px]">table_rows</span>
          Table View
        </NuxtLink>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="flex gap-4 overflow-x-auto pb-4">
      <div v-for="col in columns" :key="col.title" class="flex-shrink-0 w-[280px] flex flex-col gap-3">
        <!-- Column Header -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[12px] font-semibold text-foreground">{{ col.title }}</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold" :class="[col.color, col.textColor]">{{ col.cards.length }}</span>
          </div>
        </div>

        <!-- Cards -->
        <div class="flex flex-col gap-2.5">
          <NuxtLink
            v-for="card in col.cards"
            :key="card.id"
            :to="`/ops/cases/${card.id}`"
            class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-[12px] font-medium text-foreground">{{ card.id }}</span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[card.priorityBg, card.priorityText]">{{ card.priority }}</span>
            </div>
            <span class="font-sans text-[13px] font-medium text-foreground">{{ card.tenant }}</span>
            <div class="flex items-center justify-between">
              <span class="font-sans text-[11px] text-muted-foreground">{{ card.agent }}</span>
              <span class="font-sans text-[11px] text-muted-foreground">{{ card.updated }}</span>
            </div>
            <div v-if="card.assignee" class="flex items-center gap-1.5 pt-0.5">
              <div class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span class="font-mono text-[8px] font-semibold text-primary">{{ card.assignee.split(' ').map((n: string) => n[0]).join('') }}</span>
              </div>
              <span class="font-sans text-[11px] text-muted-foreground">{{ card.assignee }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
