<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  profile: { fullName: string; email: string; phone: string; role: string }
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', data: { firstName: string; lastName: string; email: string; phone: string; company: string }): void
}>()

const close = () => emit('update:modelValue', false)

const nameParts = computed(() => {
  const parts = props.profile.fullName.split(' ')
  return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' }
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: 'Ogundimu Properties',
})

const saving = ref(false)
const saved = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    form.firstName = nameParts.value.first
    form.lastName = nameParts.value.last
    form.email = props.profile.email
    form.phone = props.profile.phone
    saving.value = false
    saved.value = false
  }
})

const { updateProfile } = useAgents()

async function handleSave() {
  saving.value = true
  try {
    await updateProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      company: form.company,
    })
    saved.value = true
    emit('save', { ...form })
    setTimeout(() => {
      close()
    }, 1500)
  } catch { /* empty */ }
  finally { saving.value = false }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative w-full mx-4 max-w-[520px] max-h-[90vh] bg-white rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 class="font-mono text-base font-bold text-foreground">Edit Profile</h2>
            <button @click="close" class="w-8 h-8 rounded-lg bg-[#E7E8E5] flex items-center justify-center hover:bg-border transition-colors">
              <span class="material-symbols-rounded text-[18px] text-muted-foreground">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex flex-col gap-6 p-6 overflow-y-auto">
            <!-- Success Toast -->
            <div v-if="saved" class="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#DFE6E1]">
              <span class="material-symbols-rounded text-[20px] text-[#004D1A]">check_circle</span>
              <span class="font-sans text-[13px] font-medium text-[#004D1A]">Profile updated successfully</span>
            </div>

            <!-- Avatar Section -->
            <div class="flex items-center gap-5">
              <div class="relative flex-shrink-0">
                <div class="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <span class="font-mono text-[28px] font-semibold text-white">{{ form.firstName.charAt(0) }}{{ form.lastName.charAt(0) }}</span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-foreground border-2 border-white flex items-center justify-center">
                  <span class="material-symbols-rounded text-[14px] text-white">photo_camera</span>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-mono text-sm font-semibold text-foreground">Profile Photo</span>
                <span class="font-sans text-[12px] text-muted-foreground">Click to upload a new photo. JPG or PNG, max 2MB.</span>
              </div>
            </div>

            <div class="h-px bg-border" />

            <!-- Name Row -->
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1 flex flex-col gap-1.5">
                <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">FIRST NAME</label>
                <input v-model="form.firstName" type="text" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div class="flex-1 flex flex-col gap-1.5">
                <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">LAST NAME</label>
                <input v-model="form.lastName" type="text" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">EMAIL ADDRESS</label>
              <input v-model="form.email" type="email" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>

            <!-- Phone -->
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PHONE NUMBER</label>
              <input v-model="form.phone" type="tel" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>

            <!-- Company / Role -->
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1 flex flex-col gap-1.5">
                <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY NAME</label>
                <input v-model="form.company" type="text" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div class="flex-1 flex flex-col gap-1.5">
                <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">ROLE</label>
                <div class="w-full h-[44px] px-3.5 bg-[#E7E8E5] border border-border rounded-lg flex items-center justify-between">
                  <span class="font-sans text-sm text-muted-foreground">{{ profile.role }}</span>
                  <span class="material-symbols-rounded text-[16px] text-muted-foreground">lock</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <button @click="close" class="px-5 py-2.5 rounded-lg border border-border font-mono text-[13px] font-medium text-foreground hover:bg-background transition-colors">
              Cancel
            </button>
            <button
              @click="handleSave"
              :disabled="saving || saved"
              class="flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono text-[13px] font-semibold transition-all"
              :class="saved
                ? 'bg-[#DFE6E1] text-[#004D1A]'
                : 'bg-primary text-white hover:bg-primary/90'"
            >
              <span v-if="saving" class="material-symbols-rounded text-[18px] animate-spin">progress_activity</span>
              <span v-else-if="saved" class="material-symbols-rounded text-[18px]">check_circle</span>
              <span v-else class="material-symbols-rounded text-[18px]">check</span>
              {{ saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes' }}
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
