<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Edit Profile — RentCred Field Agent' })

const router = useRouter()
const { api } = useApi()
const authStore = useAuthStore()
const { uploading, progress, uploadFile, validateFile, error: uploadError } = useUpload()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const avatarUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(true)
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)

onMounted(async () => {
  try {
    const profile = await api('/auth/me') as any
    if (profile) {
      const fullName = profile.name ?? ''
      const nameParts = fullName.split(' ')
      form.firstName = nameParts[0] ?? ''
      form.lastName = nameParts.slice(1).join(' ') ?? ''
      form.email = profile.email ?? ''
      form.phone = profile.phone ?? ''
      avatarUrl.value = profile.avatarUrl ?? ''
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

const initials = computed(() => {
  return `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase()
})

async function handleAvatarSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.[0]) return

  const file = input.files[0]
  const validationError = validateFile(file)
  if (validationError) {
    uploadError.value = validationError
    return
  }

  try {
    const result = await uploadFile(file, 'profile-photos')
    avatarUrl.value = result.publicUrl
  } catch { /* error set by useUpload */ }

  if (fileInput.value) fileInput.value.value = ''
}

async function handleSave() {
  saveError.value = ''

  if (!form.firstName.trim()) {
    saveError.value = 'First name is required'
    return
  }

  saving.value = true
  try {
    await api('/auth/me', {
      method: 'PATCH',
      body: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone || undefined,
        avatarUrl: avatarUrl.value || undefined,
      },
    })
    await authStore.fetchUser()
    saved.value = true
    setTimeout(() => router.push('/field-agent/profile'), 1500)
  } catch (e: any) {
    saveError.value = e.data?.message || 'Failed to save profile'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-5 max-w-[480px] mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/field-agent/profile" class="material-symbols-rounded text-[22px] text-foreground">arrow_back</NuxtLink>
      <span class="font-mono text-base font-bold text-foreground">Edit Profile</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <span class="material-symbols-rounded text-[24px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <template v-else>
      <!-- Success Toast -->
      <div v-if="saved" class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#DFE6E1]">
        <span class="material-symbols-rounded text-[20px] text-[#004D1A]">check_circle</span>
        <span class="font-sans text-[13px] font-medium text-[#004D1A]">Profile updated successfully</span>
      </div>

      <!-- Avatar -->
      <div class="flex flex-col items-center gap-3 py-4">
        <div class="relative">
          <div class="w-20 h-20 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
            <span v-else class="font-mono text-[28px] font-semibold text-foreground">{{ initials }}</span>
          </div>
          <button
            @click="fileInput?.click()"
            class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-foreground border-2 border-white flex items-center justify-center"
            :class="{ 'opacity-50': uploading }"
           aria-label="Take photo">
            <span class="material-symbols-rounded text-[14px] text-white">photo_camera</span>
          </button>
        </div>
        <button @click="fileInput?.click()" class="font-sans text-[12px] text-primary font-medium">
          {{ uploading ? `Uploading ${progress}%...` : 'Change Photo' }}
        </button>
        <p v-if="uploadError" class="font-sans text-[12px] text-red-600">{{ uploadError }}</p>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleAvatarSelect" />
      </div>

      <!-- Form -->
      <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">First Name <span class="text-red-500">*</span></label>
          <input v-model="form.firstName" type="text" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Last Name</label>
          <input v-model="form.lastName" type="text" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Email</label>
          <div class="w-full h-[44px] px-3.5 bg-[#E7E8E5] border border-border rounded-lg flex items-center justify-between">
            <span class="font-sans text-sm text-muted-foreground">{{ form.email }}</span>
            <span class="material-symbols-rounded text-[16px] text-muted-foreground">lock</span>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Phone</label>
          <input v-model="form.phone" type="tel" placeholder="+234 800 000 0000" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Role</label>
          <div class="w-full h-[44px] px-3.5 bg-[#E7E8E5] border border-border rounded-lg flex items-center justify-between">
            <span class="font-sans text-sm text-muted-foreground">Field Agent</span>
            <span class="material-symbols-rounded text-[16px] text-muted-foreground">lock</span>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="saveError" class="flex items-start gap-2.5 bg-red-50 border border-red-200 p-3.5 rounded-xl">
        <span class="material-symbols-rounded text-[18px] text-red-600 mt-0.5">error</span>
        <span class="font-sans text-[13px] text-red-600">{{ saveError }}</span>
      </div>

      <!-- Save -->
      <button
        @click="handleSave"
        :disabled="saving || saved"
        class="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-mono text-[13px] font-semibold transition-all"
        :class="saved ? 'bg-[#DFE6E1] text-[#004D1A]' : 'bg-primary text-foreground hover:opacity-90'"
      >
        <span v-if="saving" class="material-symbols-rounded text-[18px] animate-spin">progress_activity</span>
        <span v-else-if="saved" class="material-symbols-rounded text-[18px]">check_circle</span>
        <span v-else class="material-symbols-rounded text-[18px]">check</span>
        {{ saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes' }}
      </button>
    </template>
  </div>
</template>
