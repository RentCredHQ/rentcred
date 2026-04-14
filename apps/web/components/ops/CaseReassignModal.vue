<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; submissionId?: string | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'reassigned'): void
}>()

const { api } = useApi()
const { getSubmission, reassignCase } = useSubmissions()

const close = () => emit('update:modelValue', false)

const caseInfo = ref({ id: '', tenant: '', currentAgent: '' })
const agents = ref<any[]>([])
const selectedAgent = ref<string | null>(null)
const reason = ref('')
const loading = ref(false)
const actionLoading = ref(false)

const agentColors = ['bg-primary', 'bg-[#1A56DB]', 'bg-[#004D1A]', 'bg-[#804200]', 'bg-[#8C1C00]']

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

watch(() => props.modelValue, async (open) => {
  if (!open) return
  loading.value = true
  selectedAgent.value = null
  reason.value = ''
  try {
    const fetches: Promise<any>[] = [api<any>('/field-agents')]
    if (props.submissionId) fetches.push(getSubmission(props.submissionId))

    const results = await Promise.all(fetches)
    const agentRes = results[0]
    const agentList = agentRes.data ?? agentRes ?? []

    agents.value = agentList.map((a: any, i: number) => ({
      id: a.id,
      initials: getInitials(a.name ?? ''),
      name: a.name ?? '',
      role: a.role ?? 'Agent',
      activeCases: a.activeCases ?? a.caseCount ?? 0,
      color: agentColors[i % agentColors.length],
    }))

    if (results[1]) {
      const s = results[1].data ?? results[1]
      caseInfo.value = {
        id: s.id ?? '',
        tenant: s.tenantName ?? '',
        currentAgent: s.fieldAgentName ?? s.fieldAgent?.name ?? '—',
      }
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

async function reassign() {
  if (!selectedAgent.value || !props.submissionId) return
  actionLoading.value = true
  try {
    await reassignCase(props.submissionId, { fieldAgentId: selectedAgent.value, reason: reason.value })
    emit('reassigned')
    close()
  } catch { /* empty */ }
  finally { actionLoading.value = false }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4" @click.self="close">
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <div class="relative w-full mx-4 max-w-md bg-white rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h2 class="font-mono text-[16px] font-bold text-foreground">Reassign Case</h2>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E7E8E5] hover:bg-border transition-colors">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <!-- Current Assignment -->
            <div class="bg-white border border-border rounded-xl p-4 flex flex-col gap-2">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">CURRENT ASSIGNMENT</span>
              <span class="font-mono text-[15px] font-bold text-foreground">{{ caseInfo.id }}</span>
              <span class="font-sans text-[13px] text-muted-foreground">Tenant: {{ caseInfo.tenant }}</span>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-[#804200]" />
                <span class="font-sans text-[12px] text-foreground">Currently assigned to: {{ caseInfo.currentAgent }}</span>
              </div>
            </div>

            <!-- Select Agent -->
            <span class="font-mono text-[13px] font-semibold text-foreground">Select New Agent</span>

            <!-- Search -->
            <div class="flex items-center gap-2.5 h-11 px-3.5 border border-border rounded-lg bg-white">
              <span class="material-symbols-rounded text-[20px] text-muted-foreground">search</span>
              <input type="text" placeholder="Search agents..." class="flex-1 bg-transparent text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none" />
            </div>

            <!-- Agent List -->
            <div class="flex flex-col">
              <label
                v-for="agent in agents"
                :key="agent.name"
                class="flex items-center gap-3 py-3.5 border-b border-border last:border-0 cursor-pointer"
              >
                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" :class="agent.color">
                  <span class="font-mono text-[12px] font-bold text-white">{{ agent.initials }}</span>
                </div>
                <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span class="font-sans text-[14px] font-medium text-foreground">{{ agent.name }}</span>
                  <span class="font-sans text-[12px] text-muted-foreground">{{ agent.role }} &middot; {{ agent.activeCases }} active cases</span>
                </div>
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="selectedAgent === agent.id ? 'border-primary' : 'border-border'">
                  <div v-if="selectedAgent === agent.id" class="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                <input type="radio" :value="agent.id" v-model="selectedAgent" class="sr-only" />
              </label>
            </div>

            <!-- Reason -->
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Reason for Reassignment</label>
              <textarea
                v-model="reason"
                placeholder="Agent workload balancing"
                class="w-full h-20 px-3.5 py-3 border border-border rounded-lg bg-white text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-5 py-4 border-t border-border flex-shrink-0">
            <button @click="close" class="px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans font-medium text-foreground hover:bg-background transition-colors">
              Cancel
            </button>
            <button @click="reassign" :disabled="!selectedAgent" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
              Reassign
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
