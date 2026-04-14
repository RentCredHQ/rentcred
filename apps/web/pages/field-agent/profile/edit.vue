<script setup lang="ts">
definePageMeta({ layout: 'field-agent' })
useSeoMeta({ title: 'Edit Profile — RentCred Field Agent' })

const router = useRouter()
const { api } = useApi()
const authStore = useAuthStore()
const user = authStore.user

const form = reactive({
  firstName: user?.name?.split(' ')[0] ?? '',
  lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
  email: user?.email ?? '',
  phone: '',
  location: '',
})

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  try {
    const profile = await api('/agent/profile')
    if (profile) {
      const p = profile as any
      form.phone = p.phone ?? form.phone
      form.location = p.location ?? form.location
      if (p.firstName) form.firstName = p.firstName
      if (p.lastName) form.lastName = p.lastName
      if (p.email) form.email = p.email
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

async function handleSave() {
  saving.value = true
  try {
    await api('/agent/profile', {
      method: 'PATCH',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        location: form.location,
      },
    })
    saved.value = true
    setTimeout(() => {
      router.push('/field-agent/profile')
    }, 1500)
  } catch { /* empty */ }
  finally { saving.value = false }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Nav -->
    <div class="flex items-center gap-3 -mx-4 -mt-4 px-4 py-3 border-b border-border bg-card">
      <NuxtLink to="/field-agent/profile" class="material-symbols-rounded text-[22px] text-foreground">arrow_back</NuxtLink>
      <span class="font-mono text-base font-bold text-foreground">Edit Profile</span>
    </div>

    <!-- Success Toast -->
    <div v-if="saved" class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#DFE6E1]">
      <span class="material-symbols-rounded text-[20px] text-[#004D1A]">check_circle</span>
      <span class="font-sans text-[13px] font-medium text-[#004D1A]">Profile updated successfully</span>
    </div>

    <!-- Avatar Section -->
    <div class="flex flex-col items-center gap-3 py-4">
      <div class="relative">
        <div class="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
          <span class="font-mono text-[28px] font-semibold text-white">{{ form.firstName.charAt(0) }}{{ form.lastName.charAt(0) }}</span>
        </div>
        <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-foreground border-2 border-white flex items-center justify-center">
          <span class="material-symbols-rounded text-[14px] text-white">photo_camera</span>
        </div>
      </div>
      <span class="font-sans text-[12px] text-primary font-medium">Change Photo</span>
    </div>

    <!-- Form -->
    <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="font-sans text-[13px] font-medium text-foreground">First Name</label>
        <input v-model="form.firstName" type="text" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="font-sans text-[13px] font-medium text-foreground">Last Name</label>
        <input v-model="form.lastName" type="text" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="font-sans text-[13px] font-medium text-foreground">Email</label>
        <input v-model="form.email" type="email" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="font-sans text-[13px] font-medium text-foreground">Phone</label>
        <input v-model="form.phone" type="tel" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="font-sans text-[13px] font-medium text-foreground">Location</label>
        <input v-model="form.location" type="text" class="w-full h-[44px] px-3.5 bg-background border border-border rounded-lg text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="font-sans text-[13px] font-medium text-foreground">Role</label>
        <div class="w-full h-[44px] px-3.5 bg-[#E7E8E5] border border-border rounded-lg flex items-center justify-between">
          <span class="font-sans text-sm text-muted-foreground">Field Agent</span>
          <span class="material-symbols-rounded text-[16px] text-muted-foreground">lock</span>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <button
      @click="handleSave"
      :disabled="saving || saved"
      class="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-mono text-[13px] font-semibold transition-all"
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
</template>
