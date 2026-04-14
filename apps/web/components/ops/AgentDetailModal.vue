<script setup lang="ts">
import { SUBMISSION_STATUS_LABELS } from '@rentcred/shared'

const props = defineProps<{ agentId?: string | null }>()
const show = defineModel<boolean>({ default: false })

const { api } = useApi()

const agent = ref<any>(null)
const recentCases = ref<any[]>([])
const loading = ref(false)

const statusStyleMap: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  in_progress: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  field_visit: { bg: 'bg-blue-50', text: 'text-blue-600' },
  report_building: { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
  completed: { bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
  rejected: { bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

watch(() => show.value, async (open) => {
  if (!open || !props.agentId) return
  loading.value = true
  try {
    const res = await api<any>(`/field-agents/${props.agentId}`)
    const a = res.data ?? res
    agent.value = a
    recentCases.value = (a.recentCases ?? a.assignments ?? []).slice(0, 5).map((c: any) => {
      const style = statusStyleMap[c.status] ?? { bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' }
      return {
        id: c.id ?? c.submissionId,
        tenant: c.tenantName ?? '',
        status: SUBMISSION_STATUS_LABELS[c.status] ?? c.status,
        statusBg: style.bg,
        statusText: style.text,
      }
    })
  } catch { /* empty */ }
  finally { loading.value = false }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="show = false" />
        <div class="relative bg-card rounded-xl border border-border shadow-lg w-full mx-4 max-w-lg max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span class="font-mono text-[13px] font-semibold text-foreground">{{ agent ? getInitials(agent.name) : '' }}</span>
              </div>
              <div>
                <h3 class="font-mono text-base font-semibold text-foreground">{{ agent?.name ?? '—' }}</h3>
                <span class="font-sans text-[12px] text-muted-foreground">{{ agent?.phone ?? '' }}</span>
              </div>
            </div>
            <button @click="show = false" class="text-muted-foreground hover:text-foreground">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <div v-if="agent" class="flex flex-col gap-5 p-6">
            <!-- Status & Rating -->
            <div class="flex items-center gap-3">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DFE6E1] text-[#004D1A]">{{ agent.status === 'active' ? 'Active' : agent.status === 'suspended' ? 'Suspended' : 'Inactive' }}</span>
              <div class="flex items-center gap-1">
                <span class="material-symbols-rounded text-[16px] text-primary">star</span>
                <span class="font-mono text-[13px] font-semibold text-foreground">{{ agent.rating ?? '—' }}</span>
                <span class="font-sans text-[12px] text-muted-foreground">({{ agent.reviewCount ?? 0 }} reviews)</span>
              </div>
              <span class="font-sans text-[12px] text-muted-foreground ml-auto">Last active: {{ agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—' }}</span>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-background rounded-lg p-3 flex flex-col gap-1">
                <span class="font-mono text-[11px] text-muted-foreground tracking-wider">CASES</span>
                <span class="font-mono text-lg font-bold text-foreground">{{ agent.activeCases ?? 0 }}</span>
                <span class="font-sans text-[11px] text-muted-foreground">Active now</span>
              </div>
              <div class="bg-background rounded-lg p-3 flex flex-col gap-1">
                <span class="font-mono text-[11px] text-muted-foreground tracking-wider">COMPLETED</span>
                <span class="font-mono text-lg font-bold text-[#004D1A]">{{ agent.completedCases ?? 0 }}</span>
                <span class="font-sans text-[11px] text-muted-foreground">All time</span>
              </div>
              <div class="bg-background rounded-lg p-3 flex flex-col gap-1">
                <span class="font-mono text-[11px] text-muted-foreground tracking-wider">SLA MET</span>
                <span class="font-mono text-lg font-bold text-primary">{{ agent.slaMet ?? '—' }}%</span>
                <span class="font-sans text-[11px] text-muted-foreground">This month</span>
              </div>
            </div>

            <!-- Details -->
            <div class="flex flex-col gap-3">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">DETAILS</span>
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="font-sans text-[13px] text-muted-foreground">Location</span>
                  <span class="font-sans text-[13px] text-foreground">{{ agent.location ?? agent.state ?? '—' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-sans text-[13px] text-muted-foreground">Email</span>
                  <span class="font-sans text-[13px] text-foreground">{{ agent.email ?? '—' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-sans text-[13px] text-muted-foreground">Joined</span>
                  <span class="font-sans text-[13px] text-foreground">{{ agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-sans text-[13px] text-muted-foreground">NIN Verified</span>
                  <span class="inline-flex items-center gap-1 font-sans text-[13px] text-[#004D1A]">
                    <span class="material-symbols-rounded text-[14px]">{{ agent.ninVerified ? 'check_circle' : 'cancel' }}</span>
                    {{ agent.ninVerified ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Cases -->
            <div class="flex flex-col gap-2">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RECENT CASES</span>
              <div class="flex flex-col gap-1.5">
                <div v-for="c in recentCases" :key="c.id" class="flex items-center justify-between py-1.5">
                  <span class="font-mono text-[12px] text-foreground">{{ c.id }}</span>
                  <span class="font-sans text-[12px] text-muted-foreground">{{ c.tenant }}</span>
                  <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="[c.statusBg, c.statusText]">{{ c.status }}</span>
                </div>
                <div v-if="recentCases.length === 0" class="py-2 text-center">
                  <span class="font-sans text-[12px] text-muted-foreground">No recent cases</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-2">
              <button class="flex-1 px-4 py-2.5 bg-[#8C1C00] text-white rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity">
                Suspend Agent
              </button>
              <button @click="show = false" class="flex-1 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors">
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
