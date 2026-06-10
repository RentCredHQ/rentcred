<script setup lang="ts">
const show = defineModel<boolean>({ default: false })
const emit = defineEmits<{ added: [] }>()

const { api } = useApi()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  location: '',
  nin: '',
})

const saving = ref(false)
const error = ref<string | null>(null)

const canSubmit = computed(() => form.name && form.phone && form.email && form.location)

watch(show, (val) => {
  if (val) {
    form.name = ''
    form.phone = ''
    form.email = ''
    form.location = ''
    form.nin = ''
    error.value = null
  }
})

async function handleSubmit() {
  if (!canSubmit.value) return
  saving.value = true
  error.value = null
  try {
    await api('/field-agents', { method: 'POST', body: form })
    emit('added')
    show.value = false
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to add agent. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="show = false" />
        <div class="relative bg-card rounded-xl border border-border shadow-lg w-full mx-4 max-w-md max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
            <h3 class="font-mono text-base font-semibold text-foreground">Add Field Agent</h3>
            <button @click="show = false" class="text-muted-foreground hover:text-foreground" aria-label="Close">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <div class="flex flex-col gap-4 p-6">
            <!-- Full Name -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">FULL NAME</label>
              <input v-model="form.name" type="text" placeholder="e.g. Chidi Nwosu" class="px-3 py-2.5 bg-background border border-border rounded-lg text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>

            <!-- Phone -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PHONE NUMBER</label>
              <input v-model="form.phone" type="tel" placeholder="+234 801 234 5678" class="px-3 py-2.5 bg-background border border-border rounded-lg text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">EMAIL ADDRESS</label>
              <input v-model="form.email" type="email" placeholder="agent@email.com" class="px-3 py-2.5 bg-background border border-border rounded-lg text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>

            <!-- Location -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">LOCATION</label>
              <select v-model="form.location" class="px-3 py-2.5 bg-background border border-border rounded-lg text-[13px] font-sans text-foreground outline-none focus:border-primary transition-colors">
                <option value="">Select location</option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
                <option>Ibadan</option>
                <option>Kano</option>
              </select>
            </div>

            <!-- NIN -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">NIN (NATIONAL ID)</label>
              <input v-model="form.nin" type="text" placeholder="Enter 11-digit NIN" class="px-3 py-2.5 bg-background border border-border rounded-lg text-[13px] font-sans text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>

            <!-- Error -->
            <div v-if="error" class="font-sans text-[13px] text-st-red-text">{{ error }}</div>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-2">
              <button @click="show = false" :disabled="saving" class="flex-1 px-4 py-2.5 border border-border rounded-lg text-[13px] font-sans text-foreground hover:bg-surface transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button @click="handleSubmit" :disabled="saving || !canSubmit" class="flex-1 px-4 py-2.5 bg-primary text-foreground rounded-lg text-[13px] font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {{ saving ? 'Adding...' : 'Add Agent' }}
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
